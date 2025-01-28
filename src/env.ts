const env = {
    appwrite: {
        endpoint: String(process.env.NEXT_PUBLIC_APPWRITE_HOST_URL),
        projectId: String(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID),
        apikey: String(process.env.APPWRITE_API_KEY)
    },
    appwriteDB: {
        databaseId: String(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID),
        collectionIdOD: String(process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_OD_TABLE),
        collectionIdDepartment: String(process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_DEPT_TABLE),
        collectionIdFaculty: String(process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_FACULTY_TABLE),
        collectionIdHod: String(process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_HOD_TABLE)
    }
}


export default env