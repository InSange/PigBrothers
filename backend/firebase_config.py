import firebase_admin
from firebase_admin import credentials

# Firebase ���� ���� Ű ���� ���
cred = credentials.Certificate("pig/pigbrothers-b3b15-firebase-adminsdk-btdv8-6012fc4f1b.json")

# Firebase �ʱ�ȭ
firebase_admin.initialize_app(cred)

print("Firebase Admin SDK Initialized!")
