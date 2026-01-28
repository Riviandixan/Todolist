package handler

import (
	"go-todolist/internal/service"
	"go-todolist/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req service.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, "Invalid request body")
		return
	}

	response, err := h.authService.Login(req)
	if err != nil {
		utils.UnauthorizedResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Login successful", response)
}

func (h *AuthHandler) Signup(c *gin.Context) {
	var req service.SignUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, "Invalid required body")
		return
	}

	response, err := h.authService.Signup(req)
	if err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Signup successfully", response)
}

func (h *AuthHandler) GetUsers(c *gin.Context) {
	users, err := h.authService.FindAllUsers()
	if err != nil {
		utils.InternalServerErrorResponse(c, "Failed to fetch users")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Users retrieved successfully", users)
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")
	uID, _ := userID.(int)

	var req struct {
		Username     string `json:"username"`
		ProfilePhoto string `json:"profile_photo"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, "Invalid request body")
		return
	}

	if err := h.authService.UpdateProfile(uID, req.Username, req.ProfilePhoto); err != nil {
		utils.InternalServerErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Profile updated successfully", nil)
}

func (h *AuthHandler) UpdatePassword(c *gin.Context) {
	userID, _ := c.Get("user_id")
	uID, _ := userID.(int)

	var req struct {
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, "Invalid request body")
		return
	}

	if err := h.authService.UpdatePassword(uID, req.Password); err != nil {
		utils.InternalServerErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Password updated successfully", nil)
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID, _ := c.Get("user_id")
	uID, _ := userID.(int)

	user, err := h.authService.GetUserByID(uID)
	if err != nil {
		utils.InternalServerErrorResponse(c, "User not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "User data retrieved", user)
}
