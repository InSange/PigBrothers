import firebase_admin
from firebase_admin import credentials

# Firebase 서비스 계정 키 파일 경로
cred = credentials.Certificate("pig/pigbrothers-b3b15-firebase-adminsdk-btdv8-6012fc4f1b.json")

# Firebase 초기화
firebase_admin.initialize_app(cred)

print("Firebase Admin SDK Initialized!")
