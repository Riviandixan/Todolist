package handler

import (
	"go-todolist/internal/service"
	"go-todolist/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ActivityLogHandler struct {
	activityLogService *service.ActivityLogService
}

func NewActivityLogHandler(activityLogService *service.ActivityLogService) *ActivityLogHandler {
	return &ActivityLogHandler{
		activityLogService: activityLogService,
	}
}

func (h *ActivityLogHandler) GetAll(c *gin.Context) {
	logs, err := h.activityLogService.FindAll()
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch activity logs")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Activity logs retrieved successfully", logs)
}
