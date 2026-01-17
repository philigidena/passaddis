export declare enum ShopCategory {
    WATER = "WATER",
    DRINKS = "DRINKS",
    SNACKS = "SNACKS",
    MERCH = "MERCH"
}
export declare class ShopItemQueryDto {
    category?: ShopCategory;
    search?: string;
}
export declare class CartItemDto {
    shopItemId: string;
    quantity: number;
}
export declare class CreateShopOrderDto {
    items: CartItemDto[];
    pickupLocationId: string;
}
export declare class ValidatePickupDto {
    qrCode: string;
}
