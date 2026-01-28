package main

import (
	"go-todolist/internal/app"
	"go-todolist/internal/config"
	"go-todolist/internal/database"
	"go-todolist/internal/handler"
	"go-todolist/internal/repository"
	"go-todolist/internal/service"
	"go-todolist/internal/utils"
	"log"
)

func main() {
	// load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// set JWT secret
	utils.SetJWTSecret(cfg.JWT.Secret)

	// Connect to database
	db, err := database.Connect(cfg.GetDSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close(db)

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	ticketRepo := repository.NewTicketRepository(db)
	activityLogRepo := repository.NewActivityLogRepository(db)

	// Initialize services
	authService := service.NewAuthService(userRepo)
	activityLogService := service.NewActivityLogService(activityLogRepo)
	ticketService := service.NewTicketService(ticketRepo, activityLogRepo)

	// Initialize handlers
	authHanler := handler.NewAuthHandler(authService)
	ticketHandler := handler.NewTicketHandler(ticketService)
	activityLogHandler := handler.NewActivityLogHandler(activityLogService)

	// Setup router
	router := app.NewRouter(
		authHanler,
		ticketHandler,
		activityLogHandler,
	)

	// Create and start server
	server := app.NewServer(router.Setup(), cfg.Server.Port)
	if err := server.Start(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
