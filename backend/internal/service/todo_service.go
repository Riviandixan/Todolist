package service

import "go-todolist/internal/domain"

type TodoService struct {
	todoRepository domain.TodoRepository
}

type TodoRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
}

type TodoResponse struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
}

func NewTodoService(todoRepository domain.TodoRepository) *TodoService {
	return &TodoService{
		todoRepository: todoRepository,
	}
}

func (s *TodoService) CreateTodo(req TodoRequest) (*TodoResponse, error) {
	todo := &domain.Todo{
		Title:       req.Title,
		Description: req.Description,
		Status:      req.Status,
	}

	if err := s.todoRepository.Create(todo); err != nil {
		return nil, err
	}

	return &TodoResponse{
		ID:          todo.ID,
		Title:       todo.Title,
		Description: todo.Description,
		Status:      todo.Status,
	}, nil
}

func (s *TodoService) FindAll() ([]TodoResponse, error) {
	todos, err := s.todoRepository.FindAll()
	if err != nil {
		return nil, err
	}

	var todoResponses []TodoResponse
	for _, todo := range todos {
		todoResponses = append(todoResponses, TodoResponse{
			ID:          todo.ID,
			Title:       todo.Title,
			Description: todo.Description,
			Status:      todo.Status,
		})
	}

	return todoResponses, nil
}

func (s *TodoService) FindById(id int) (*TodoResponse, error) {
	todo, err := s.todoRepository.FindById(id)
	if err != nil {
		return nil, err
	}

	return &TodoResponse{
		ID:          todo.ID,
		Title:       todo.Title,
		Description: todo.Description,
		Status:      todo.Status,
	}, nil
}

func (s *TodoService) UpdateTodo(id int, req TodoRequest) (*TodoResponse, error) {
	todo, err := s.todoRepository.FindById(id)
	if err != nil {
		return nil, err
	}

	todo.Title = req.Title
	todo.Description = req.Description
	todo.Status = req.Status

	if err := s.todoRepository.Update(todo); err != nil {
		return nil, err
	}

	return &TodoResponse{
		ID:          todo.ID,
		Title:       todo.Title,
		Description: todo.Description,
		Status:      todo.Status,
	}, nil
}

func (s *TodoService) DeleteTodo(id int) error {
	if err := s.todoRepository.Delete(id); err != nil {
		return err
	}
	return nil
}
