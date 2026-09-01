using Microsoft.Extensions.Options;
using MongoDB.Driver;
using OnlineStoreAPI.Models;
using OnlineStoreAPI.Settings;

namespace OnlineStoreAPI.Services
{
    public class MongoDbService
    {
        public IMongoCollection<User> Users { get; }
        public IMongoCollection<Product> Products { get; }
        public IMongoCollection<Order> Orders { get; }
        public IMongoCollection<Category> Categories { get; }

        public MongoDbService(IOptions<MongoDBSettings> mongoSettings)
        {
            var client = new MongoClient(mongoSettings.Value.ConnectionURI);

            var database = client.GetDatabase(mongoSettings.Value.DatabaseName);

            Users = database.GetCollection<User>(
                mongoSettings.Value.UsersCollection);

            Products = database.GetCollection<Product>(
                mongoSettings.Value.ProductsCollection);

            Orders = database.GetCollection<Order>(
                mongoSettings.Value.OrdersCollection);

            Categories = database.GetCollection<Category>(
                mongoSettings.Value.CategoriesCollection);
        }
    }
}