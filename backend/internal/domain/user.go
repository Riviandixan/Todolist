package domain

import "time"

type User struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	Password     string    `json:"-"`
	ProfilePhoto string    `json:"profile_photo,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type UserRepository interface {
	Create(user *User) error
	FindByUsername(username string) (*User, error)
	FindByID(id int) (*User, error)
	FindAll() ([]User, error)
	Update(user *User) error
}
