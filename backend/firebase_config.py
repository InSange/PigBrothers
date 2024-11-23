import firebase_admin
from firebase_admin import credentials, firestore, db

# Firebase ���� ���� Ű ���� ���
cred = credentials.Certificate("pigbrothers-b3b15-firebase-adminsdk-btdv8-6012fc4f1b.json")

# Realtime Database �ʱ�ȭ
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://pigbrothers-b3b15-default-rtdb.firebaseio.com/'
})

# Firestore Ŭ���̾�Ʈ ����
firestore_client = firestore.client()

# Realtime Database Ŭ���̾�Ʈ ����
realtime_db = db.reference("/")

print("Firebase Admin SDK Initialized!")
