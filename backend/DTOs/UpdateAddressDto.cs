using System.ComponentModel.DataAnnotations;

namespace OnlineStoreAPI.DTOs
{
    public class UpdateAddressDto
    {
        [Required]
        public string City { get; set; } = null!;

        [Required]
        public string Street { get; set; } = null!;

        [Required]
        public string Number { get; set; } = null!;
    }
}