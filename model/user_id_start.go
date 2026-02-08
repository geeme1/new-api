package model

import "github.com/QuantumNous/new-api/common"

func ensureUserIDStart() error {
	if common.UserIDStart <= 1 {
		return nil
	}
	maxID, err := getRawMaxUserId()
	if err != nil {
		return err
	}
	nextID := common.UserIDStart
	if maxID+1 > nextID {
		nextID = maxID + 1
	}

	switch {
	case common.UsingMySQL:
		return DB.Exec("ALTER TABLE `users` AUTO_INCREMENT = ?", nextID).Error
	case common.UsingPostgreSQL:
		var seq string
		if err := DB.Raw("SELECT pg_get_serial_sequence('users', 'id')").Scan(&seq).Error; err != nil {
			return err
		}
		if seq == "" {
			return nil
		}
		return DB.Exec("SELECT setval(?, ?, true)", seq, nextID-1).Error
	case common.UsingSQLite:
		var exists int
		if err := DB.Raw("SELECT count(1) FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'").Scan(&exists).Error; err != nil {
			return err
		}
		if exists == 0 {
			return nil
		}
		result := DB.Exec("UPDATE sqlite_sequence SET seq = ? WHERE name = ?", nextID-1, "users")
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return DB.Exec("INSERT INTO sqlite_sequence(name, seq) VALUES(?, ?)", "users", nextID-1).Error
		}
	}
	return nil
}
