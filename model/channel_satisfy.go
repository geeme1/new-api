package model

import (
	"sort"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
)

func IsChannelEnabledForGroupModel(group string, modelName string, channelID int) bool {
	if group == "" || modelName == "" || channelID <= 0 {
		return false
	}
	if !common.MemoryCacheEnabled {
		return isChannelEnabledForGroupModelDB(group, modelName, channelID)
	}

	channelSyncLock.RLock()
	defer channelSyncLock.RUnlock()

	if group2model2channels == nil {
		return false
	}

	if isChannelIDInList(group2model2channels[group][modelName], channelID) {
		return true
	}
	normalized := ratio_setting.FormatMatchingModelName(modelName)
	if normalized != "" && normalized != modelName {
		return isChannelIDInList(group2model2channels[group][normalized], channelID)
	}
	return false
}

func IsChannelEnabledForAnyGroupModel(groups []string, modelName string, channelID int) bool {
	if len(groups) == 0 {
		return false
	}
	for _, g := range groups {
		if IsChannelEnabledForGroupModel(g, modelName, channelID) {
			return true
		}
	}
	return false
}

func GetEnabledChannelIDsForGroupModel(group string, modelName string) []int {
	if group == "" || modelName == "" {
		return nil
	}
	if !common.MemoryCacheEnabled {
		return getEnabledChannelIDsForGroupModelDB(group, modelName)
	}

	channelSyncLock.RLock()
	defer channelSyncLock.RUnlock()

	if group2model2channels == nil {
		return nil
	}

	channels := append([]int(nil), group2model2channels[group][modelName]...)
	if len(channels) == 0 {
		normalized := ratio_setting.FormatMatchingModelName(modelName)
		if normalized != "" && normalized != modelName {
			channels = append([]int(nil), group2model2channels[group][normalized]...)
		}
	}
	return channels
}

func GetEnabledChannelIDsForAnyGroupsModel(groups []string, modelName string) []int {
	if len(groups) == 0 || modelName == "" {
		return nil
	}
	seen := make(map[int]struct{})
	result := make([]int, 0)
	for _, group := range groups {
		for _, id := range GetEnabledChannelIDsForGroupModel(group, modelName) {
			if _, ok := seen[id]; ok {
				continue
			}
			seen[id] = struct{}{}
			result = append(result, id)
		}
	}
	sort.Ints(result)
	return result
}

func isChannelEnabledForGroupModelDB(group string, modelName string, channelID int) bool {
	var count int64
	err := DB.Model(&Ability{}).
		Where(commonGroupCol+" = ? and model = ? and channel_id = ? and enabled = ?", group, modelName, channelID, true).
		Count(&count).Error
	if err == nil && count > 0 {
		return true
	}
	normalized := ratio_setting.FormatMatchingModelName(modelName)
	if normalized == "" || normalized == modelName {
		return false
	}
	count = 0
	err = DB.Model(&Ability{}).
		Where(commonGroupCol+" = ? and model = ? and channel_id = ? and enabled = ?", group, normalized, channelID, true).
		Count(&count).Error
	return err == nil && count > 0
}

func getEnabledChannelIDsForGroupModelDB(group string, modelName string) []int {
	var ids []int
	err := DB.Model(&Ability{}).
		Where(commonGroupCol+" = ? and model = ? and enabled = ?", group, modelName, true).
		Pluck("channel_id", &ids).Error
	if err == nil && len(ids) > 0 {
		return ids
	}
	normalized := ratio_setting.FormatMatchingModelName(modelName)
	if normalized == "" || normalized == modelName {
		return nil
	}
	ids = nil
	err = DB.Model(&Ability{}).
		Where(commonGroupCol+" = ? and model = ? and enabled = ?", group, normalized, true).
		Pluck("channel_id", &ids).Error
	if err != nil {
		return nil
	}
	return ids
}

func isChannelIDInList(list []int, channelID int) bool {
	for _, id := range list {
		if id == channelID {
			return true
		}
	}
	return false
}
