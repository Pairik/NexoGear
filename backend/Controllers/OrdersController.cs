using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using OnlineStoreAPI.DTOs;
using OnlineStoreAPI.Models;
using OnlineStoreAPI.Services;
using System.Net;
using System.Security.Claims;

namespace OnlineStoreAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;
        private readonly EmailService _emailService;

        public OrdersController(
            MongoDbService mongoDbService,
            EmailService emailService)
        {
            _mongoDbService = mongoDbService;
            _emailService = emailService;
        }


        // USER: Create order
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateOrder(
            CreateOrderDto dto)
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            var userEmail = User.FindFirstValue(
                ClaimTypes.Email);

            if (userId == null ||
                userEmail == null)
            {
                return Unauthorized();
            }

            if (dto.Products == null ||
                dto.Products.Count == 0)
            {
                return BadRequest(
                    "The order must contain at least one product.");
            }

            if (string.IsNullOrWhiteSpace(dto.City) ||
                string.IsNullOrWhiteSpace(dto.Street) ||
                string.IsNullOrWhiteSpace(dto.Number))
            {
                return BadRequest(
                    "Shipping address is required.");
            }


            var orderItems =
                new List<OrderItem>();

            var reservedProducts =
                new List<(string ProductId, int Quantity)>();

            decimal totalPrice = 0;


            try
            {
                foreach (var item in dto.Products)
                {
                    if (item.Quantity <= 0)
                    {
                        throw new Exception(
                            "Product quantity must be greater than 0.");
                    }


                    var product =
                        await _mongoDbService.Products
                            .Find(
                                p => p.Id == item.ProductId
                            )
                            .FirstOrDefaultAsync();


                    if (product == null)
                    {
                        throw new Exception(
                            $"Product with id {item.ProductId} was not found.");
                    }


                    // Product must exist and
                    // enough stock must be available.
                    var filter =
                        Builders<Product>.Filter.And(

                            Builders<Product>.Filter.Eq(
                                p => p.Id,
                                item.ProductId),

                            Builders<Product>.Filter.Gte(
                                p => p.Quantity,
                                item.Quantity)
                        );


                    // Atomically decrease stock.
                    var update =
                        Builders<Product>.Update
                            .Inc(
                                p => p.Quantity,
                                -item.Quantity);


                    var updateResult =
                        await _mongoDbService.Products
                            .UpdateOneAsync(
                                filter,
                                update);


                    if (updateResult.ModifiedCount == 0)
                    {
                        throw new Exception(
                            $"Not enough quantity available for {product.Name}.");
                    }


                    reservedProducts.Add(
                        (
                            product.Id!,
                            item.Quantity
                        )
                    );


                    orderItems.Add(
                        new OrderItem
                        {
                            ProductId =
                                product.Id!,

                            ProductName =
                                product.Name,

                            Price =
                                product.Price,

                            Quantity =
                                item.Quantity,

                            ImageUrl =
                                product.ImageUrl
                        }
                    );


                    totalPrice +=
                        product.Price *
                        item.Quantity;
                }


                var order = new Order
                {
                    UserId = userId,

                    Products = orderItems,

                    TotalPrice = totalPrice,

                    Status = "Pending",

                    ShippingAddress =
                        new Address
                        {
                            City =
                                dto.City.Trim(),

                            Street =
                                dto.Street.Trim(),

                            Number =
                                dto.Number.Trim()
                        },

                    OrderDate =
                        DateTime.UtcNow
                };


                await _mongoDbService.Orders
                    .InsertOneAsync(order);


                // Same short order number
                // that the customer sees in My Orders.
                var orderNumber =
                    GetOrderNumber(order.Id);


                // -------------------------------------------------
                // EMAIL PRODUCT ROWS
                // -------------------------------------------------

                var productsHtml = "";


                foreach (var item in order.Products)
                {
                    var encodedProductName =
                        WebUtility.HtmlEncode(
                            item.ProductName);

                    productsHtml += $@"
                        <tr>
                            <td style=""padding:16px 10px;border-bottom:1px solid #eeeeee;font-size:14px;color:#222222;"">
                                <strong>
                                    {encodedProductName}
                                </strong>
                            </td>

                            <td style=""padding:16px 10px;border-bottom:1px solid #eeeeee;text-align:center;font-size:14px;color:#555555;"">
                                {item.Quantity}
                            </td>

                            <td style=""padding:16px 10px;border-bottom:1px solid #eeeeee;text-align:right;font-size:14px;color:#555555;"">
                                {item.Price:F2} €
                            </td>

                            <td style=""padding:16px 10px;border-bottom:1px solid #eeeeee;text-align:right;font-size:14px;font-weight:700;color:#222222;"">
                                {(item.Price * item.Quantity):F2} €
                            </td>
                        </tr>
                    ";
                }


                var encodedCity =
                    WebUtility.HtmlEncode(
                        order.ShippingAddress.City);

                var encodedStreet =
                    WebUtility.HtmlEncode(
                        order.ShippingAddress.Street);

                var encodedNumber =
                    WebUtility.HtmlEncode(
                        order.ShippingAddress.Number);

                var encodedUserEmail =
                    WebUtility.HtmlEncode(
                        userEmail);


                // -------------------------------------------------
                // CUSTOMER EMAIL
                // -------------------------------------------------

                var customerEmailBody = $@"
<!DOCTYPE html>

<html>
<head>
    <meta charset=""UTF-8"">
</head>

<body style=""
    margin:0;
    padding:0;
    background-color:#f4f4f4;
    font-family:Arial,Helvetica,sans-serif;
    color:#222222;
"">

    <table
        width=""100%""
        cellpadding=""0""
        cellspacing=""0""
        border=""0""
        style=""
            background-color:#f4f4f4;
            padding:35px 15px;
        ""
    >
        <tr>
            <td align=""center"">

                <table
                    width=""100%""
                    cellpadding=""0""
                    cellspacing=""0""
                    border=""0""
                    style=""
                        max-width:650px;
                        background-color:#ffffff;
                        border-radius:12px;
                        overflow:hidden;
                    ""
                >

                    <!-- HEADER -->

                    <tr>
                        <td style=""
                            background-color:#222222;
                            padding:24px 30px;
                        "">

                            <div style=""
                                font-size:28px;
                                font-weight:700;
                                color:#ffffff;
                            "">
                                NexoGear
                            </div>

                        </td>
                    </tr>


                    <!-- MAIN CONTENT -->

                    <tr>
                        <td style=""
                            padding:35px 30px;
                        "">

                            <h1 style=""
                                margin:0 0 10px;
                                font-size:26px;
                                color:#222222;
                            "">
                                Thank you for your order!
                            </h1>


                            <p style=""
                                margin:0 0 28px;
                                font-size:15px;
                                color:#666666;
                                line-height:1.6;
                            "">
                                We have successfully received
                                your order and will begin
                                processing it soon.
                            </p>


                            <!-- ORDER INFO -->

                            <table
                                width=""100%""
                                cellpadding=""0""
                                cellspacing=""0""
                                border=""0""
                                style=""
                                    margin-bottom:30px;
                                    background-color:#f5f5f5;
                                    border-radius:8px;
                                ""
                            >
                                <tr>

                                    <td style=""
                                        padding:18px 20px;
                                    "">

                                        <div style=""
                                            font-size:11px;
                                            text-transform:uppercase;
                                            color:#888888;
                                            margin-bottom:6px;
                                        "">
                                            Order Number
                                        </div>

                                        <div style=""
                                            font-size:17px;
                                            font-weight:700;
                                            color:#222222;
                                        "">
                                            #{orderNumber}
                                        </div>

                                    </td>


                                    <td style=""
                                        padding:18px 20px;
                                    "">

                                        <div style=""
                                            font-size:11px;
                                            text-transform:uppercase;
                                            color:#888888;
                                            margin-bottom:6px;
                                        "">
                                            Status
                                        </div>

                                        <div style=""
                                            font-size:14px;
                                            font-weight:700;
                                            color:#856404;
                                            background-color:#fff3cd;
                                            display:inline-block;
                                            padding:6px 12px;
                                            border-radius:20px;
                                        "">
                                            Pending
                                        </div>

                                    </td>


                                    <td style=""
                                        padding:18px 20px;
                                        text-align:right;
                                    "">

                                        <div style=""
                                            font-size:11px;
                                            text-transform:uppercase;
                                            color:#888888;
                                            margin-bottom:6px;
                                        "">
                                            Total
                                        </div>

                                        <div style=""
                                            font-size:18px;
                                            font-weight:700;
                                            color:#222222;
                                        "">
                                            {order.TotalPrice:F2} €
                                        </div>

                                    </td>

                                </tr>
                            </table>


                            <!-- PRODUCTS -->

                            <h2 style=""
                                margin:0 0 15px;
                                font-size:19px;
                                color:#222222;
                            "">
                                Your Products
                            </h2>


                            <table
                                width=""100%""
                                cellpadding=""0""
                                cellspacing=""0""
                                border=""0""
                                style=""
                                    border-collapse:collapse;
                                ""
                            >

                                <thead>

                                    <tr style=""
                                        background-color:#f5f5f5;
                                    "">

                                        <th
                                            align=""left""
                                            style=""
                                                padding:12px 10px;
                                                font-size:12px;
                                                text-transform:uppercase;
                                                color:#777777;
                                            ""
                                        >
                                            Product
                                        </th>


                                        <th
                                            align=""center""
                                            style=""
                                                padding:12px 10px;
                                                font-size:12px;
                                                text-transform:uppercase;
                                                color:#777777;
                                            ""
                                        >
                                            Quantity
                                        </th>


                                        <th
                                            align=""right""
                                            style=""
                                                padding:12px 10px;
                                                font-size:12px;
                                                text-transform:uppercase;
                                                color:#777777;
                                            ""
                                        >
                                            Price
                                        </th>


                                        <th
                                            align=""right""
                                            style=""
                                                padding:12px 10px;
                                                font-size:12px;
                                                text-transform:uppercase;
                                                color:#777777;
                                            ""
                                        >
                                            Total
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>
                                    {productsHtml}
                                </tbody>

                            </table>


                            <!-- ORDER TOTAL -->

                            <table
                                width=""100%""
                                cellpadding=""0""
                                cellspacing=""0""
                                border=""0""
                                style=""
                                    margin-top:20px;
                                ""
                            >
                                <tr>

                                    <td
                                        align=""right""
                                        style=""
                                            font-size:20px;
                                            font-weight:700;
                                            color:#222222;
                                        ""
                                    >
                                        Total:
                                        {order.TotalPrice:F2} €
                                    </td>

                                </tr>
                            </table>


                            <!-- SHIPPING ADDRESS -->

                            <div style=""
                                margin-top:32px;
                                padding:20px;
                                background-color:#f5f5f5;
                                border-radius:8px;
                            "">

                                <div style=""
                                    font-size:12px;
                                    font-weight:700;
                                    text-transform:uppercase;
                                    color:#777777;
                                    margin-bottom:10px;
                                "">
                                    Shipping Address
                                </div>


                                <div style=""
                                    font-size:15px;
                                    color:#222222;
                                    line-height:1.6;
                                "">

                                    {encodedCity}
                                    <br>

                                    {encodedStreet}
                                    {encodedNumber}

                                </div>

                            </div>


                            <p style=""
                                margin:30px 0 0;
                                font-size:14px;
                                color:#666666;
                                line-height:1.6;
                            "">
                                You can check the current status
                                of your order at any time from
                                <strong>My Orders</strong>
                                in your NexoGear account.
                            </p>

                        </td>
                    </tr>


                    <!-- FOOTER -->

                    <tr>
                        <td style=""
                            padding:22px 30px;
                            background-color:#eeeeee;
                            text-align:center;
                        "">

                            <div style=""
                                font-size:15px;
                                font-weight:700;
                                color:#222222;
                                margin-bottom:5px;
                            "">
                                NexoGear
                            </div>

                            <div style=""
                                font-size:12px;
                                color:#777777;
                            "">
                                Thank you for shopping with us.
                            </div>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
";


                // -------------------------------------------------
                // ADMIN EMAIL
                // -------------------------------------------------

                var adminEmailBody = $@"
<!DOCTYPE html>

<html>
<head>
    <meta charset=""UTF-8"">
</head>

<body style=""
    margin:0;
    padding:0;
    background-color:#f4f4f4;
    font-family:Arial,Helvetica,sans-serif;
    color:#222222;
"">

    <table
        width=""100%""
        cellpadding=""0""
        cellspacing=""0""
        border=""0""
        style=""
            background-color:#f4f4f4;
            padding:35px 15px;
        ""
    >
        <tr>
            <td align=""center"">

                <table
                    width=""100%""
                    cellpadding=""0""
                    cellspacing=""0""
                    border=""0""
                    style=""
                        max-width:650px;
                        background-color:#ffffff;
                        border-radius:12px;
                        overflow:hidden;
                    ""
                >

                    <!-- HEADER -->

                    <tr>
                        <td style=""
                            background-color:#222222;
                            padding:24px 30px;
                        "">

                            <div style=""
                                font-size:28px;
                                font-weight:700;
                                color:#ffffff;
                            "">
                                NexoGear
                            </div>

                        </td>
                    </tr>


                    <!-- CONTENT -->

                    <tr>
                        <td style=""
                            padding:35px 30px;
                        "">

                            <h1 style=""
                                margin:0 0 10px;
                                font-size:25px;
                                color:#222222;
                            "">
                                New Order Received
                            </h1>


                            <p style=""
                                margin:0 0 28px;
                                color:#666666;
                                font-size:15px;
                            "">
                                A customer has placed
                                a new order.
                            </p>


                            <!-- ORDER INFO -->

                            <table
                                width=""100%""
                                cellpadding=""0""
                                cellspacing=""0""
                                border=""0""
                                style=""
                                    margin-bottom:30px;
                                    background-color:#f5f5f5;
                                    border-radius:8px;
                                ""
                            >
                                <tr>

                                    <td style=""
                                        padding:18px 20px;
                                    "">

                                        <div style=""
                                            font-size:11px;
                                            text-transform:uppercase;
                                            color:#888888;
                                            margin-bottom:6px;
                                        "">
                                            Order Number
                                        </div>

                                        <strong style=""
                                            font-size:18px;
                                            color:#222222;
                                        "">
                                            #{orderNumber}
                                        </strong>

                                    </td>


                                    <td style=""
                                        padding:18px 20px;
                                    "">

                                        <div style=""
                                            font-size:11px;
                                            text-transform:uppercase;
                                            color:#888888;
                                            margin-bottom:6px;
                                        "">
                                            Customer
                                        </div>

                                        <strong style=""
                                            font-size:14px;
                                            color:#222222;
                                        "">
                                            {encodedUserEmail}
                                        </strong>

                                    </td>


                                    <td style=""
                                        padding:18px 20px;
                                        text-align:right;
                                    "">

                                        <div style=""
                                            font-size:11px;
                                            text-transform:uppercase;
                                            color:#888888;
                                            margin-bottom:6px;
                                        "">
                                            Total
                                        </div>

                                        <strong style=""
                                            font-size:19px;
                                            color:#222222;
                                        "">
                                            {order.TotalPrice:F2} €
                                        </strong>

                                    </td>

                                </tr>
                            </table>


                            <!-- PRODUCTS -->

                            <h2 style=""
                                font-size:19px;
                                margin:0 0 15px;
                                color:#222222;
                            "">
                                Products
                            </h2>


                            <table
                                width=""100%""
                                cellpadding=""0""
                                cellspacing=""0""
                                border=""0""
                                style=""
                                    border-collapse:collapse;
                                ""
                            >

                                <thead>

                                    <tr style=""
                                        background-color:#f5f5f5;
                                    "">

                                        <th
                                            align=""left""
                                            style=""
                                                padding:12px 10px;
                                                font-size:12px;
                                                color:#777777;
                                            ""
                                        >
                                            PRODUCT
                                        </th>


                                        <th
                                            align=""center""
                                            style=""
                                                padding:12px 10px;
                                                font-size:12px;
                                                color:#777777;
                                            ""
                                        >
                                            QTY
                                        </th>


                                        <th
                                            align=""right""
                                            style=""
                                                padding:12px 10px;
                                                font-size:12px;
                                                color:#777777;
                                            ""
                                        >
                                            PRICE
                                        </th>


                                        <th
                                            align=""right""
                                            style=""
                                                padding:12px 10px;
                                                font-size:12px;
                                                color:#777777;
                                            ""
                                        >
                                            TOTAL
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>
                                    {productsHtml}
                                </tbody>

                            </table>


                            <!-- SHIPPING ADDRESS -->

                            <div style=""
                                margin-top:30px;
                                padding:20px;
                                background-color:#f5f5f5;
                                border-radius:8px;
                            "">

                                <div style=""
                                    font-size:12px;
                                    font-weight:700;
                                    color:#777777;
                                    text-transform:uppercase;
                                    margin-bottom:10px;
                                "">
                                    Shipping Address
                                </div>


                                <div style=""
                                    font-size:15px;
                                    line-height:1.6;
                                    color:#222222;
                                "">

                                    {encodedCity}
                                    <br>

                                    {encodedStreet}
                                    {encodedNumber}

                                </div>

                            </div>


                            <p style=""
                                margin:30px 0 0;
                                font-size:14px;
                                color:#666666;
                            "">
                                Open
                                <strong>Admin Orders</strong>
                                in NexoGear to process
                                this order.
                            </p>

                        </td>
                    </tr>


                    <!-- FOOTER -->

                    <tr>
                        <td style=""
                            padding:20px 30px;
                            background-color:#eeeeee;
                            text-align:center;
                            color:#777777;
                            font-size:12px;
                        "">
                            NexoGear Administration
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
";


                // -------------------------------------------------
                // SEND EMAILS
                // -------------------------------------------------

                try
                {
                    await _emailService.SendEmailAsync(
                        userEmail,
                        $"NexoGear - Order #{orderNumber} confirmed",
                        customerEmailBody);


                    await _emailService.SendEmailAsync(
                        _emailService.GetAdminEmail(),
                        $"NexoGear - New Order #{orderNumber}",
                        adminEmailBody);
                }
                catch (Exception ex)
                {
                    // Email failure must not
                    // delete an already created order.
                    Console.WriteLine(
                        $"Email error: {ex.Message}");
                }


                return Ok(new
                {
                    message =
                        "Order created successfully.",

                    orderId =
                        order.Id,

                    orderNumber =
                        orderNumber,

                    totalPrice =
                        order.TotalPrice
                });
            }
            catch (Exception ex)
            {
                // If one product was reserved,
                // but another one failed,
                // return reserved stock.

                foreach (var reserved
                         in reservedProducts)
                {
                    var restoreUpdate =
                        Builders<Product>.Update
                            .Inc(
                                p => p.Quantity,
                                reserved.Quantity);


                    await _mongoDbService.Products
                        .UpdateOneAsync(

                            p => p.Id ==
                                 reserved.ProductId,

                            restoreUpdate
                        );
                }


                return BadRequest(
                    ex.Message);
            }
        }


        // USER: My Orders
        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);


            if (userId == null)
            {
                return Unauthorized();
            }


            var orders =
                await _mongoDbService.Orders

                    .Find(
                        o => o.UserId == userId)

                    .SortByDescending(
                        o => o.OrderDate)

                    .ToListAsync();


            return Ok(orders);
        }


        // ADMIN: All orders
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders =
                await _mongoDbService.Orders

                    .Find(_ => true)

                    .SortByDescending(
                        o => o.OrderDate)

                    .ToListAsync();


            return Ok(orders);
        }


        // ADMIN: Update order status
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(
            string id,
            UpdateOrderStatusDto dto)
        {
            var allowedStatuses =
                new[]
                {
                    "Pending",
                    "Processing",
                    "Completed",
                    "Cancelled"
                };


            if (!allowedStatuses.Contains(
                    dto.Status))
            {
                return BadRequest(
                    "Invalid status. Allowed statuses: " +
                    "Pending, Processing, Completed, Cancelled.");
            }


            var update =
                Builders<Order>.Update
                    .Set(
                        o => o.Status,
                        dto.Status);


            var result =
                await _mongoDbService.Orders
                    .UpdateOneAsync(

                        o => o.Id == id,

                        update
                    );


            if (result.MatchedCount == 0)
            {
                return NotFound(
                    "Order not found.");
            }


            return Ok(
                new
                {
                    message =
                        "Order status updated successfully."
                }
            );
        }


        // Converts the MongoDB ObjectId
        // to the same short Order Number
        // shown in the React application.
        private static string GetOrderNumber(
            string? orderId)
        {
            if (string.IsNullOrWhiteSpace(
                    orderId))
            {
                return "";
            }


            var shortId =
                orderId.Length > 8
                    ? orderId[^8..]
                    : orderId;


            return shortId
                .ToUpperInvariant();
        }
    }
}