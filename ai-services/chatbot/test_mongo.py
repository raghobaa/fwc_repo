from pymongo import MongoClient
import certifi

uri = "mongodb+srv://mehaksiddique8971_db_user:u7hHlHbaDko51ZPr@cluster0.dewhoim.mongodb.net/?appName=Cluster0"

client = MongoClient(
    uri,
    tls=True,
    tlsCAFile=certifi.where()
)

print(client.admin.command("ping"))