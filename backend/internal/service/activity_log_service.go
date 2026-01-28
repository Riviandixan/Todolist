package service

import "go-todolist/internal/domain"

type ActivityLogService struct {
	activityLogRepo domain.ActivityLogRepository
}

func NewActivityLogService(activityLogRepo domain.ActivityLogRepository) *ActivityLogService {
	return &ActivityLogService{
		activityLogRepo: activityLogRepo,
	}
}

func (s *ActivityLogService) FindAll() ([]domain.ActivityLog, error) {
	return s.activityLogRepo.FindAll()
}

func (s *ActivityLogService) CreateLog(ticketID *int, userID int, action string) error {
	log := &domain.ActivityLog{
		TicketID: ticketID,
		UserID:   userID,
		Action:   action,
	}
	return s.activityLogRepo.Create(log)
}
