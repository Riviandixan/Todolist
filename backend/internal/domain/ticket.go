package domain

import "time"

type Ticket struct {
	ID               int        `json:"id"`
	Title            string     `json:"title"`
	Description      string     `json:"description"`
	Status           string     `json:"status"`
	Priority         string     `json:"priority"`
	CreatorID        int        `json:"creator_id"`
	CreatorUsername  string     `json:"creator_username"`
	AssigneeID       *int       `json:"assignee_id,omitempty"`
	AssigneeUsername *string    `json:"assignee_username,omitempty"`
	DueDate          *time.Time `json:"due_date,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

type TicketRepository interface {
	Create(ticket *Ticket) error
	FindAll() ([]Ticket, error)
	FindByID(id int) (*Ticket, error)
	Update(ticket *Ticket) error
	Delete(id int) error
	FindByStatus(status string) ([]Ticket, error)
	UpdateStatus(id int, status string) error
}
