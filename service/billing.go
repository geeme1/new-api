package service

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/types"
	"github.com/gin-gonic/gin"
)

const (
	BillingSourceWallet       = "wallet"
	BillingSourceSubscription = "subscription"
)

// PreConsumeBilling decides whether to pre-consume from subscription or wallet based on user preference.
// It also always pre-consumes token quota in quota units (same as legacy flow).
func PreConsumeBilling(c *gin.Context, preConsumedQuota int, relayInfo *relaycommon.RelayInfo) *types.NewAPIError {
	if relayInfo == nil {
		return types.NewError(fmt.Errorf("relayInfo is nil"), types.ErrorCodeInvalidRequest, types.ErrOptionWithSkipRetry())
	}

	pref := common.NormalizeBillingPreference(relayInfo.UserSetting.BillingPreference)
	candidateChannelIDs := getSubscriptionCandidateChannelIDs(c, relayInfo)
	trySubscription := func() *types.NewAPIError {
		quotaType := 0
		// For total quota: consume preConsumedQuota quota units.
		subConsume := int64(preConsumedQuota)
		if subConsume <= 0 {
			subConsume = 1
		}

		// Pre-consume token quota in quota units to keep token limits consistent.
		if preConsumedQuota > 0 {
			if err := PreConsumeTokenQuota(relayInfo, preConsumedQuota); err != nil {
				return types.NewErrorWithStatusCode(err, types.ErrorCodePreConsumeTokenQuotaFailed, http.StatusForbidden, types.ErrOptionWithSkipRetry(), types.ErrOptionWithNoRecordErrorLog())
			}
		}

		res, err := model.PreConsumeUserSubscription(relayInfo.RequestId, relayInfo.UserId, relayInfo.OriginModelName, quotaType, subConsume, candidateChannelIDs)
		if err != nil {
			// revert token pre-consume when subscription fails
			if preConsumedQuota > 0 && !relayInfo.IsPlayground {
				_ = model.IncreaseTokenQuota(relayInfo.TokenId, relayInfo.TokenKey, preConsumedQuota)
			}
			errMsg := err.Error()
			if strings.Contains(errMsg, "no active subscription") || strings.Contains(errMsg, "subscription quota insufficient") {
				return types.NewErrorWithStatusCode(fmt.Errorf("订阅额度不足或未配置订阅: %s", errMsg), types.ErrorCodeInsufficientUserQuota, http.StatusForbidden, types.ErrOptionWithSkipRetry(), types.ErrOptionWithNoRecordErrorLog())
			}
			return types.NewErrorWithStatusCode(fmt.Errorf("订阅预扣失败: %s", errMsg), types.ErrorCodeQueryDataError, http.StatusInternalServerError)
		}

		relayInfo.BillingSource = BillingSourceSubscription
		relayInfo.SubscriptionId = res.UserSubscriptionId
		relayInfo.SubscriptionPreConsumed = res.PreConsumed
		relayInfo.SubscriptionPostDelta = 0
		relayInfo.SubscriptionAmountTotal = res.AmountTotal
		relayInfo.SubscriptionAmountUsedAfterPreConsume = res.AmountUsedAfter
		if planInfo, err := model.GetSubscriptionPlanInfoByUserSubscriptionId(res.UserSubscriptionId); err == nil && planInfo != nil {
			relayInfo.SubscriptionPlanId = planInfo.PlanId
			relayInfo.SubscriptionPlanTitle = planInfo.PlanTitle
			if plan, err := model.GetSubscriptionPlanById(planInfo.PlanId); err == nil && plan != nil {
				common.SetContextKey(c, constant.ContextKeySubscriptionAllowedChannelIDs, plan.GetChannelIDs())
			}
		}
		relayInfo.FinalPreConsumedQuota = preConsumedQuota

		logger.LogInfo(c, fmt.Sprintf("用户 %d 使用订阅计费预扣：订阅=%d，token_quota=%d", relayInfo.UserId, res.PreConsumed, preConsumedQuota))
		return nil
	}

	tryWallet := func() *types.NewAPIError {
		relayInfo.BillingSource = BillingSourceWallet
		relayInfo.SubscriptionId = 0
		relayInfo.SubscriptionPreConsumed = 0
		common.SetContextKey(c, constant.ContextKeySubscriptionAllowedChannelIDs, []int{})
		return PreConsumeQuota(c, preConsumedQuota, relayInfo)
	}

	switch pref {
	case "subscription_only":
		return trySubscription()
	case "wallet_only":
		return tryWallet()
	case "wallet_first":
		if err := tryWallet(); err != nil {
			// only fallback for insufficient wallet quota
			if err.GetErrorCode() == types.ErrorCodeInsufficientUserQuota {
				return trySubscription()
			}
			return err
		}
		return nil
	case "subscription_first":
		fallthrough
	default:
		if err := trySubscription(); err != nil {
			// fallback only when subscription not available/insufficient
			if err.GetErrorCode() == types.ErrorCodeInsufficientUserQuota {
				return tryWallet()
			}
			return err
		}
		return nil
	}
}

func getSubscriptionCandidateChannelIDs(c *gin.Context, relayInfo *relaycommon.RelayInfo) []int {
	if c == nil || relayInfo == nil || relayInfo.OriginModelName == "" {
		return nil
	}
	if specificChannel, ok := common.GetContextKey(c, constant.ContextKeyTokenSpecificChannelId); ok {
		switch value := specificChannel.(type) {
		case string:
			if id, err := strconv.Atoi(value); err == nil && id > 0 {
				return []int{id}
			}
		case int:
			if value > 0 {
				return []int{value}
			}
		}
	}
	usingGroup := common.GetContextKeyString(c, constant.ContextKeyUsingGroup)
	if usingGroup == "" {
		usingGroup = relayInfo.UsingGroup
	}
	if usingGroup == "auto" {
		return model.GetEnabledChannelIDsForAnyGroupsModel(GetUserAutoGroup(relayInfo.UserGroup), relayInfo.OriginModelName)
	}
	return model.GetEnabledChannelIDsForGroupModel(usingGroup, relayInfo.OriginModelName)
}
