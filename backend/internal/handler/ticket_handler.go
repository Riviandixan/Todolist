package handler

import (
	"go-todolist/internal/service"
	"go-todolist/internal/utils"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TicketHandler struct {
	ticketService *service.TicketService
}

func NewTicketHandler(ticketService *service.TicketService) *TicketHandler {
	return &TicketHandler{
		ticketService: ticketService,
	}
}

func (h *TicketHandler) Create(c *gin.Context) {
	var req service.TicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, "Invalid request body")
		return
	}

	log.Printf("Received ticket create request: %+v", req)

	// Get user ID from middlewre (logic for this will be added/checked)
	userID, _ := c.Get("user_id")
	if id, ok := userID.(int); ok {
		req.CreatorID = id
	}

	response, err := h.ticketService.CreateTicket(req)
	if err != nil {
		utils.InternalServerErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Ticket created successfully", response)
}

func (h *TicketHandler) GetAll(c *gin.Context) {
	response, err := h.ticketService.FindAll()
	if err != nil {
		utils.InternalServerErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Tickets retrieved successfully", response)
}

func (h *TicketHandler) GetByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ValidationErrorResponse(c, "Invalid ticket ID")
		return
	}

	response, err := h.ticketService.FindByID(id)
	if err != nil {
		utils.NotFoundResponse(c, "Ticket not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Ticket retrieved successfully", response)
}

func (h *TicketHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ValidationErrorResponse(c, "Invalid ticket ID")
		return
	}

	var req service.TicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, "Invalid request body")
		return
	}

	response, err := h.ticketService.UpdateTicket(id, req)
	if err != nil {
		utils.InternalServerErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Ticket updated successfully", response)
}

func (h *TicketHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ValidationErrorResponse(c, "Invalid ticket ID")
		return
	}

	if err := h.ticketService.DeleteTicket(id); err != nil {
		utils.InternalServerErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Ticket deleted successfully", nil)
}

func (h *TicketHandler) UpdateStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ValidationErrorResponse(c, "Invalid ticket ID")
		return
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, "Invalid request body")
		return
	}

	userID, _ := c.Get("user_id")
	uID, _ := userID.(int)

	if err := h.ticketService.UpdateStatus(id, req.Status, uID); err != nil {
		utils.InternalServerErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Ticket status updated successfully", nil)
}
