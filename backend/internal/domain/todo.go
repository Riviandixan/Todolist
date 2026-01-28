package domain

import "time"

type Todo struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type TodoRepository interface {
	Create(todo *Todo) error
	FindAll() ([]Todo, error)
	FindById(id int) (*Todo, error)
	Update(todo *Todo) error
	Delete(id int) error
}
