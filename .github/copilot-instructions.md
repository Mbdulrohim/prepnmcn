<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements

- [x] Scaffold the Project

- [x] Customize the Project

- [x] Install Required Extensions

- [x] Compile the Project

- [x] Create and Run Task

- [x] Launch the Project

- [x] Ensure Documentation is Complete

## Database Configuration

- **TypeORM synchronize: true** - Database schema automatically syncs with entity changes, no manual migrations needed
- **Database**: PostgreSQL
- **ORM**: TypeORM with custom entities in `/src/entities/`
- **Connection**: Configured in `/src/lib/database.ts`
