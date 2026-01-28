package repository

import (
	"context"
	"fmt"
	"go-todolist/internal/domain"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ticketRepository struct {
	db *pgxpool.Pool
}

func NewTicketRepository(db *pgxpool.Pool) domain.TicketRepository {
	return &ticketRepository{db: db}
}

func (r *ticketRepository) Create(ticket *domain.Ticket) error {
	query := `
		INSERT INTO tickets (title, description, status, priority, due_date, creator_id, assignee_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
	`

	now := time.Now().UTC()
	ticket.CreatedAt = now
	ticket.UpdatedAt = now

	if ticket.Status == "" {
		ticket.Status = "Backlog"
	}
	if ticket.Priority == "" {
		ticket.Priority = "Medium"
	}

	err := r.db.QueryRow(
		context.Background(),
		query,
		ticket.Title,
		ticket.Description,
		ticket.Status,
		ticket.Priority,
		ticket.DueDate,
		ticket.CreatorID,
		ticket.AssigneeID,
		ticket.CreatedAt,
		ticket.UpdatedAt,
	).Scan(&ticket.ID)

	if err != nil {
		return fmt.Errorf("failed to create ticket: %w", err)
	}

	return nil
}

func (r *ticketRepository) FindAll() ([]domain.Ticket, error) {
	query := `
		SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date, t.creator_id, u1.username as creator_username, t.assignee_id, u2.username as assignee_username, t.created_at, t.updated_at
		FROM tickets t
		JOIN users u1 ON t.creator_id = u1.id
		LEFT JOIN users u2 ON t.assignee_id = u2.id
		ORDER BY t.created_at DESC
	`

	rows, err := r.db.Query(context.Background(), query)
	if err != nil {
		return nil, fmt.Errorf("failed to query tickets: %w", err)
	}
	defer rows.Close()

	var tickets []domain.Ticket
	for rows.Next() {
		var t domain.Ticket
		err := rows.Scan(
			&t.ID,
			&t.Title,
			&t.Description,
			&t.Status,
			&t.Priority,
			&t.DueDate,
			&t.CreatorID,
			&t.CreatorUsername,
			&t.AssigneeID,
			&t.AssigneeUsername,
			&t.CreatedAt,
			&t.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan ticket: %w", err)
		}
		tickets = append(tickets, t)
	}

	return tickets, nil
}

func (r *ticketRepository) FindByID(id int) (*domain.Ticket, error) {
	query := `
		SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date, t.creator_id, u1.username as creator_username, t.assignee_id, u2.username as assignee_username, t.created_at, t.updated_at
		FROM tickets t
		JOIN users u1 ON t.creator_id = u1.id
		LEFT JOIN users u2 ON t.assignee_id = u2.id
		WHERE t.id = $1
	`

	t := &domain.Ticket{}
	err := r.db.QueryRow(context.Background(), query, id).Scan(
		&t.ID,
		&t.Title,
		&t.Description,
		&t.Status,
		&t.Priority,
		&t.DueDate,
		&t.CreatorID,
		&t.CreatorUsername,
		&t.AssigneeID,
		&t.AssigneeUsername,
		&t.CreatedAt,
		&t.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("ticket not found: %w", err)
	}

	return t, nil
}

func (r *ticketRepository) Update(ticket *domain.Ticket) error {
	query := `
		UPDATE tickets
		SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, assignee_id = $6, updated_at = $7
		WHERE id = $8
	`

	ticket.UpdatedAt = time.Now().UTC()

	_, err := r.db.Exec(
		context.Background(),
		query,
		ticket.Title,
		ticket.Description,
		ticket.Status,
		ticket.Priority,
		ticket.DueDate,
		ticket.AssigneeID,
		ticket.UpdatedAt,
		ticket.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update ticket: %w", err)
	}

	return nil
}

func (r *ticketRepository) Delete(id int) error {
	query := `DELETE FROM tickets WHERE id = $1`

	_, err := r.db.Exec(context.Background(), query, id)
	if err != nil {
		return fmt.Errorf("failed to delete ticket: %w", err)
	}

	return nil
}

func (r *ticketRepository) FindByStatus(status string) ([]domain.Ticket, error) {
	query := `
		SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date, t.creator_id, u1.username as creator_username, t.assignee_id, u2.username as assignee_username, t.created_at, t.updated_at
		FROM tickets t
		JOIN users u1 ON t.creator_id = u1.id
		LEFT JOIN users u2 ON t.assignee_id = u2.id
		WHERE t.status = $1
		ORDER BY t.created_at DESC
	`

	rows, err := r.db.Query(context.Background(), query, status)
	if err != nil {
		return nil, fmt.Errorf("failed to query tickets by status: %w", err)
	}
	defer rows.Close()

	var tickets []domain.Ticket
	for rows.Next() {
		var t domain.Ticket
		err := rows.Scan(
			&t.ID,
			&t.Title,
			&t.Description,
			&t.Status,
			&t.Priority,
			&t.DueDate,
			&t.CreatorID,
			&t.CreatorUsername,
			&t.AssigneeID,
			&t.AssigneeUsername,
			&t.CreatedAt,
			&t.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan ticket: %w", err)
		}
		tickets = append(tickets, t)
	}

	return tickets, nil
}

func (r *ticketRepository) UpdateStatus(id int, status string) error {
	query := `UPDATE tickets SET status = $1, updated_at = $2 WHERE id = $3`

	_, err := r.db.Exec(context.Background(), query, status, time.Now().UTC(), id)
	if err != nil {
		return fmt.Errorf("failed to update ticket status: %w", err)
	}

	return nil
}
