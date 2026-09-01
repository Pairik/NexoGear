using System.ComponentModel.DataAnnotations;

namespace OnlineStoreAPI.DTOs
{
    public class ProductDto
    {
        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Description { get; set; } = null!;

        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }

        [Required]
        public string Category { get; set; } = null!;

        [Required]
        public string Brand { get; set; } = null!;

        public string ImageUrl { get; set; } = "";
    }
}