## Directory Structure

### `app`
```
src/
├── assets/          ← images, icons, logos
├── components/      ← reusable UI components (Navbar, PetCard, etc.)
├── pages/           ← one file per page
├── services/        ← Axios API call functions
├── context/         ← React context (for auth state)
└── hooks/           ← custom hooks (optional)
```

### `server`
```
purrfect-haven-server/
├── config/
│   └── db.js          ← database connection pool
├── database/
│   ├── migrate.js    ← runs schema.sql programmatically
│   └── schema.sql  
├── controllers/       ← business logic (one file per resource)
├── middleware/        ← auth guards, error handlers
├── routes/            ← API route definitions
├── uploads/           ← multer saves pet/report photos here
├── .env
├── .gitignore
├── package.json
└── server.js          ← app entry point
```