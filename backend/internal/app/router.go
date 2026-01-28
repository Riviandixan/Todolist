package app

import (
	"go-todolist/internal/handler"
	"go-todolist/internal/middleware"

	"github.com/gin-gonic/gin"
)

type Router struct {
	authHanler         *handler.AuthHandler
	ticketHandler      *handler.TicketHandler
	activityLogHandler *handler.ActivityLogHandler
}

func NewRouter(
	authHanler *handler.AuthHandler,
	ticketHandler *handler.TicketHandler,
	activityLogHandler *handler.ActivityLogHandler,
) *Router {
	return &Router{
		authHanler:         authHanler,
		ticketHandler:      ticketHandler,
		activityLogHandler: activityLogHandler,
	}
}

func (r *Router) Setup() *gin.Engine {
	router := gin.Default()

	// Apply CORS middleware
	router.Use(middleware.CORSMiddleware())

	// API routes
	api := router.Group("/api")
	{
		api.GET("/users", middleware.AuthMiddleware(), r.authHanler.GetUsers)

		// Public routes - Authentication
		auth := api.Group("/auth")
		{
			auth.POST("/login", r.authHanler.Login)
			auth.POST("/signup", r.authHanler.Signup)
			auth.GET("/me", middleware.AuthMiddleware(), r.authHanler.Me)
		}

		// Profile routes
		profile := api.Group("/profile")
		profile.Use(middleware.AuthMiddleware())
		{
			profile.PUT("/", r.authHanler.UpdateProfile)
			profile.PUT("/password", r.authHanler.UpdatePassword)
		}

		// Private routes - Tickets
		tickets := api.Group("/tickets")
		tickets.Use(middleware.AuthMiddleware())
		{
			tickets.POST("/", r.ticketHandler.Create)
			tickets.GET("/", r.ticketHandler.GetAll)
			tickets.GET("/:id", r.ticketHandler.GetByID)
			tickets.PUT("/:id", r.ticketHandler.Update)
			tickets.DELETE("/:id", r.ticketHandler.Delete)
			tickets.PATCH("/:id/status", r.ticketHandler.UpdateStatus)
		}

		// Activity Logs
		logs := api.Group("/logs")
		logs.Use(middleware.AuthMiddleware())
		{
			logs.GET("/", r.activityLogHandler.GetAll)
		}
	}

	return router
}
