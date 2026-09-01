using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using OnlineStoreAPI.Models;
using OnlineStoreAPI.Services;
using Microsoft.AspNetCore.Authorization;
using OnlineStoreAPI.DTOs;

namespace OnlineStoreAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public ProductsController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<List<Product>>> GetProducts()
        {
            var products = await _mongoDbService.Products
                .Find(_ => true)
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProductById(string id)
        {
            var product = await _mongoDbService.Products
                .Find(p => p.Id == id)
                .FirstOrDefaultAsync();

            if (product == null)
            {
                return NotFound("Product not found.");
            }

            return Ok(product);
        }

        // POST: api/products
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Product>>
    CreateProduct(ProductDto dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                Quantity = dto.Quantity,
                Category = dto.Category,
                Brand = dto.Brand,
                ImageUrl = dto.ImageUrl
            };

            await _mongoDbService.Products
                .InsertOneAsync(product);

            return CreatedAtAction(
                nameof(GetProductById),
                new { id = product.Id },
                product);
        }

        // PUT: api/products/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(
    string id,
    ProductDto dto)
        {
            var existingProduct =
                await _mongoDbService.Products
                    .Find(p => p.Id == id)
                    .FirstOrDefaultAsync();

            if (existingProduct == null)
            {
                return NotFound(
                    "Product not found.");
            }

            existingProduct.Name =
                dto.Name;

            existingProduct.Description =
                dto.Description;

            existingProduct.Price =
                dto.Price;

            existingProduct.Quantity =
                dto.Quantity;

            existingProduct.Category =
                dto.Category;

            existingProduct.Brand =
                dto.Brand;

            existingProduct.ImageUrl =
                dto.ImageUrl;

            await _mongoDbService.Products
                .ReplaceOneAsync(
                    p => p.Id == id,
                    existingProduct);

            return NoContent();
        }

        // PUT: api/products/{id}/stock
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/stock")]
        public async Task<IActionResult> AddStock(
            string id,
            AddStockDto dto)
        {
            var update = Builders<Product>.Update
                .Inc(p => p.Quantity, dto.Quantity);

            var result =
                await _mongoDbService.Products.UpdateOneAsync(
                    p => p.Id == id,
                    update);

            if (result.MatchedCount == 0)
            {
                return NotFound("Product not found.");
            }

            var updatedProduct =
                await _mongoDbService.Products
                    .Find(p => p.Id == id)
                    .FirstOrDefaultAsync();

            return Ok(updatedProduct);
        }

        // DELETE: api/products/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(string id)
        {
            var result = await _mongoDbService.Products.DeleteOneAsync(
                p => p.Id == id);

            if (result.DeletedCount == 0)
            {
                return NotFound("Product not found.");
            }

            return NoContent();
        }
    }
}