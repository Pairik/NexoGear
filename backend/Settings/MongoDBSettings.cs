namespace OnlineStoreAPI.Settings
{
    public class MongoDBSettings
    {
        public string ConnectionURI { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
        public string UsersCollection { get; set; } = null!;
        public string ProductsCollection { get; set; } = null!;
        public string OrdersCollection { get; set; } = null!;
        public string CategoriesCollection { get; set; } = null!;
    }
}
