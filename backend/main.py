# def main():
#     print("Hello from athena!")


# if __name__ == "__main__":
#     main()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.estimations import router as estimations_router

app = FastAPI(title="Repair Platform API")

# CORS-Einstellung für das Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router einbinden
app.include_router(estimations_router)