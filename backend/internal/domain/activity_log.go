package domain

import "time"

type ActivityLog struct {
	ID        int       `json:"id"`
	TicketID  *int      `json:"ticket_id"`
	UserID    int       `json:"user_id"`
	Username  string    `json:"username"` // For frontend convenience
	Action    string    `json:"action"`
	CreatedAt time.Time `json:"created_at"`
}

type ActivityLogRepository interface {
	Create(log *ActivityLog) error
	FindAll() ([]ActivityLog, error)
}
