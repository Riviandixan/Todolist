package service

import (
	"go-todolist/internal/domain"
	"time"
)

type TicketService struct {
	ticketRepo      domain.TicketRepository
	activityLogRepo domain.ActivityLogRepository
}

type TicketRequest struct {
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	Priority    string     `json:"priority"`
	DueDate     *time.Time `json:"due_date"`
	CreatorID   int        `json:"creator_id"`
	AssigneeID  *int       `json:"assignee_id"`
}

type TicketResponse struct {
	ID               int        `json:"id"`
	Title            string     `json:"title"`
	Description      string     `json:"description"`
	Status           string     `json:"status"`
	Priority         string     `json:"priority"`
	DueDate          *time.Time `json:"due_date,omitempty"`
	CreatorID        int        `json:"creator_id"`
	CreatorUsername  string     `json:"creator_username"`
	AssigneeID       *int       `json:"assignee_id"`
	AssigneeUsername *string    `json:"assignee_username,omitempty"`
}

func NewTicketService(ticketRepo domain.TicketRepository, activityLogRepo domain.ActivityLogRepository) *TicketService {
	return &TicketService{
		ticketRepo:      ticketRepo,
		activityLogRepo: activityLogRepo,
	}
}

func (s *TicketService) CreateTicket(req TicketRequest) (*TicketResponse, error) {
	ticket := &domain.Ticket{
		Title:       req.Title,
		Description: req.Description,
		Status:      req.Status,
		Priority:    req.Priority,
		DueDate:     req.DueDate,
		CreatorID:   req.CreatorID,
		AssigneeID:  req.AssigneeID,
	}

	if err := s.ticketRepo.Create(ticket); err != nil {
		return nil, err
	}

	// Log activity
	s.activityLogRepo.Create(&domain.ActivityLog{
		TicketID: &ticket.ID,
		UserID:   ticket.CreatorID,
		Action:   "created ticket: " + ticket.Title,
	})

	// For create, we might need a fresh fetch to get the usernames if the repo doesn't return them
	// but let's assume the repo FindByID will be used or returned
	t, err := s.ticketRepo.FindByID(ticket.ID)
	if err != nil {
		return nil, err
	}

	return &TicketResponse{
		ID:               t.ID,
		Title:            t.Title,
		Description:      t.Description,
		Status:           t.Status,
		Priority:         t.Priority,
		DueDate:          t.DueDate,
		CreatorID:        t.CreatorID,
		CreatorUsername:  t.CreatorUsername,
		AssigneeID:       t.AssigneeID,
		AssigneeUsername: t.AssigneeUsername,
	}, nil
}

func (s *TicketService) FindAll() ([]TicketResponse, error) {
	tickets, err := s.ticketRepo.FindAll()
	if err != nil {
		return nil, err
	}

	var responses []TicketResponse
	for _, t := range tickets {
		responses = append(responses, TicketResponse{
			ID:               t.ID,
			Title:            t.Title,
			Description:      t.Description,
			Status:           t.Status,
			Priority:         t.Priority,
			DueDate:          t.DueDate,
			CreatorID:        t.CreatorID,
			CreatorUsername:  t.CreatorUsername,
			AssigneeID:       t.AssigneeID,
			AssigneeUsername: t.AssigneeUsername,
		})
	}

	return responses, nil
}

func (s *TicketService) FindByID(id int) (*TicketResponse, error) {
	t, err := s.ticketRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	return &TicketResponse{
		ID:               t.ID,
		Title:            t.Title,
		Description:      t.Description,
		Status:           t.Status,
		Priority:         t.Priority,
		DueDate:          t.DueDate,
		CreatorID:        t.CreatorID,
		CreatorUsername:  t.CreatorUsername,
		AssigneeID:       t.AssigneeID,
		AssigneeUsername: t.AssigneeUsername,
	}, nil
}

func (s *TicketService) UpdateTicket(id int, req TicketRequest) (*TicketResponse, error) {
	t, err := s.ticketRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	t.Title = req.Title
	t.Description = req.Description
	t.Status = req.Status
	t.Priority = req.Priority
	t.DueDate = req.DueDate
	t.AssigneeID = req.AssigneeID

	if err := s.ticketRepo.Update(t); err != nil {
		return nil, err
	}

	// Log activity (assuming we have a user context here - usually from request)
	// For now, let's just use creator_id or standard log
	s.activityLogRepo.Create(&domain.ActivityLog{
		TicketID: &id,
		UserID:   t.CreatorID, // In real world, this should be the current user
		Action:   "updated ticket: " + t.Title,
	})

	// Fetch again to get usernames
	updated, err := s.ticketRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	return &TicketResponse{
		ID:               updated.ID,
		Title:            updated.Title,
		Description:      updated.Description,
		Status:           updated.Status,
		Priority:         updated.Priority,
		DueDate:          updated.DueDate,
		CreatorID:        updated.CreatorID,
		CreatorUsername:  updated.CreatorUsername,
		AssigneeID:       updated.AssigneeID,
		AssigneeUsername: updated.AssigneeUsername,
	}, nil
}

func (s *TicketService) DeleteTicket(id int) error {
	return s.ticketRepo.Delete(id)
}

func (s *TicketService) UpdateStatus(id int, status string, userID int) error {
	if err := s.ticketRepo.UpdateStatus(id, status); err != nil {
		return err
	}

	// Log activity
	s.activityLogRepo.Create(&domain.ActivityLog{
		TicketID: &id,
		UserID:   userID,
		Action:   "changed status to " + status,
	})

	return nil
}
