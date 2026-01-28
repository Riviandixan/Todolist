package repository

import (
	"context"
	"fmt"
	"go-todolist/internal/domain"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type activityLogRepository struct {
	db *pgxpool.Pool
}

func NewActivityLogRepository(db *pgxpool.Pool) domain.ActivityLogRepository {
	return &activityLogRepository{db: db}
}

func (r *activityLogRepository) Create(log *domain.ActivityLog) error {
	query := `
		INSERT INTO activity_logs (ticket_id, user_id, action, created_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`

	err := r.db.QueryRow(
		context.Background(),
		query,
		log.TicketID,
		log.UserID,
		log.Action,
		time.Now().UTC(),
	).Scan(&log.ID, &log.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create activity log: %w", err)
	}

	return nil
}

func (r *activityLogRepository) FindAll() ([]domain.ActivityLog, error) {
	query := `
		SELECT al.id, al.ticket_id, al.user_id, u.username, al.action, al.created_at
		FROM activity_logs al
		JOIN users u ON al.user_id = u.id
		ORDER BY al.created_at DESC
		LIMIT 100
	`

	rows, err := r.db.Query(context.Background(), query)
	if err != nil {
		return nil, fmt.Errorf("failed to query activity logs: %w", err)
	}
	defer rows.Close()

	var logs []domain.ActivityLog
	for rows.Next() {
		var l domain.ActivityLog
		err := rows.Scan(
			&l.ID,
			&l.TicketID,
			&l.UserID,
			&l.Username,
			&l.Action,
			&l.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan activity log: %w", err)
		}
		logs = append(logs, l)
	}

	return logs, nil
}
