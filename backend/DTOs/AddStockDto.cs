using System.ComponentModel.DataAnnotations;

namespace OnlineStoreAPI.DTOs
{
    public class AddStockDto
    {
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}