using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace OnlineStoreAPI.Models
{
    public class Product
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        [Required]
        public string Name { get; set; } = null!;

        [BsonElement("description")]
        [Required]
        public string Description { get; set; } = null!;

        [BsonElement("price")]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        [BsonElement("quantity")]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }

        [BsonElement("category")]
        [Required]
        public string Category { get; set; } = null!;

        [BsonElement("brand")]
        [Required]
        public string Brand { get; set; } = null!;

        [BsonElement("imageUrl")]
        public string ImageUrl { get; set; } = "";
    }
}