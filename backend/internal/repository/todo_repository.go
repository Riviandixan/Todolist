package repository

import (
	"context"
	"fmt"
	"go-todolist/internal/domain"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type todoRepository struct {
	db *pgxpool.Pool
}

func NewTodoRepository(db *pgxpool.Pool) domain.TodoRepository {
	return &todoRepository{db: db}
}

func (r *todoRepository) Create(todo *domain.Todo) error {
	query := `
		INSERT INTO todos (user_id, title, description, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`

	now := time.Now()
	todo.CreatedAt = now
	todo.UpdatedAt = now

	err := r.db.QueryRow(
		context.Background(),
		query,
		todo.UserID,
		todo.Title,
		todo.Description,
		todo.Status,
		todo.CreatedAt,
		todo.UpdatedAt,
	).Scan(&todo.UserID)

	if err != nil {
		return fmt.Errorf("failed to create todo: %w", err)
	}

	return nil
}

func (r *todoRepository) FindAll() ([]domain.Todo, error) {
	query := `
		SELECT id, user_id, title, description, status, created_at, updated_at
		FROM todos
	`

	rows, err := r.db.Query(context.Background(), query)
	if err != nil {
		return nil, fmt.Errorf("failed to query todos: %w", err)
	}
	defer rows.Close()

	var todos []domain.Todo
	for rows.Next() {
		var todo domain.Todo
		err := rows.Scan(
			&todo.ID,
			&todo.UserID,
			&todo.Title,
			&todo.Description,
			&todo.Status,
			&todo.CreatedAt,
			&todo.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan todo: %w", err)
		}
		todos = append(todos, todo)
	}

	return todos, nil
}

func (r *todoRepository) FindById(id int) (*domain.Todo, error) {
	query := `
		SELECT id, user_id, title, description, status, created_at, updated_at
		FROM todos
		WHERE id = $1
	`

	todo := &domain.Todo{}
	err := r.db.QueryRow(context.Background(), query, id).Scan(
		&todo.ID,
		&todo.UserID,
		&todo.Title,
		&todo.Description,
		&todo.Status,
		&todo.CreatedAt,
		&todo.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("todo not found: %w", err)
	}

	return todo, nil
}

func (r *todoRepository) Update(todo *domain.Todo) error {
	query := `
		UPDATE todos
		SET user_id = $1, title = $2, description = $3, status = $4, updated_at = $5
		WHERE id = $6
	`

	now := time.Now()
	todo.UpdatedAt = now

	err := r.db.QueryRow(
		context.Background(),
		query,
		todo.UserID,
		todo.Title,
		todo.Description,
		todo.Status,
		todo.UpdatedAt,
		todo.ID,
	).Scan(&todo.ID)

	if err != nil {
		return fmt.Errorf("failed to update todo: %w", err)
	}

	return nil
}

func (r *todoRepository) Delete(id int) error {
	query := `
		DELETE FROM todos
		WHERE id = $1
	`

	err := r.db.QueryRow(context.Background(), query, id).Scan(&id)

	if err != nil {
		return fmt.Errorf("failed to delete todo: %w", err)
	}

	return nil
}
