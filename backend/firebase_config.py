import firebase_admin
from firebase_admin import credentials, firestore, db

# Firebase 서비스 계정 키 파일 경로
cred = credentials.Certificate("pigbrothers-b3b15-firebase-adminsdk-btdv8-6012fc4f1b.json")

# Realtime Database 초기화
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://pigbrothers-b3b15-default-rtdb.firebaseio.com/'
})

# Firestore 클라이언트 생성
firestore_client = firestore.client()

# Realtime Database 클라이언트 생성
realtime_db = db.reference("/")

print("Firebase Admin SDK Initialized!")
