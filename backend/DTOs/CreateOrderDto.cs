using System.ComponentModel.DataAnnotations;

namespace OnlineStoreAPI.DTOs
{
    public class CreateOrderDto
    {
        [Required]
        [MinLength(1)]
        public List<CreateOrderItemDto>
            Products
        { get; set; } = new();

        [Required]
        public string City { get; set; }
            = null!;

        [Required]
        public string Street { get; set; }
            = null!;

        [Required]
        public string Number { get; set; }
            = null!;
    }

    public class CreateOrderItemDto
    {
        [Required]
        public string ProductId { get; set; }
            = null!;

        [Range(1, 100)]
        public int Quantity { get; set; }
    }
}