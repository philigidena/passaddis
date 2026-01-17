import { PrismaService } from '../prisma/prisma.service';
import { ShopItemQueryDto, CreateShopOrderDto, ValidatePickupDto } from './dto/shop.dto';
export declare class ShopService {
    private prisma;
    constructor(prisma: PrismaService);
    getItems(query: ShopItemQueryDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        imageUrl: string | null;
        category: import(".prisma/client").$Enums.ShopCategory;
        price: number;
        inStock: boolean;
    }[]>;
    getPickupLocations(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        area: string;
        hours: string;
        isActive: boolean;
    }[]>;
    createOrder(userId: string, dto: CreateShopOrderDto): Promise<{
        order: {
            pickupLocation: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                address: string;
                area: string;
                hours: string;
                isActive: boolean;
            } | null;
            items: ({
                shopItem: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    imageUrl: string | null;
                    category: import(".prisma/client").$Enums.ShopCategory;
                    price: number;
                    inStock: boolean;
                };
            } & {
                id: string;
                createdAt: Date;
                price: number;
                quantity: number;
                orderId: string;
                shopItemId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            total: number;
            qrCode: string | null;
            orderNumber: string;
            subtotal: number;
            serviceFee: number;
            platformFee: number;
            merchantAmount: number | null;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            paymentRef: string | null;
            pickedUpAt: Date | null;
            settledAt: Date | null;
            pickupLocationId: string | null;
        };
        paymentRequired: number;
    }>;
    getUserOrders(userId: string): Promise<({
        pickupLocation: {
            name: string;
            area: string;
        } | null;
        items: ({
            shopItem: {
                name: string;
                imageUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            price: number;
            quantity: number;
            orderId: string;
            shopItemId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        total: number;
        qrCode: string | null;
        orderNumber: string;
        subtotal: number;
        serviceFee: number;
        platformFee: number;
        merchantAmount: number | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentRef: string | null;
        pickedUpAt: Date | null;
        settledAt: Date | null;
        pickupLocationId: string | null;
    })[]>;
    getOrder(userId: string, orderId: string): Promise<{
        qrCodeImage: string | null;
        pickupLocation: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            area: string;
            hours: string;
            isActive: boolean;
        } | null;
        items: ({
            shopItem: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                imageUrl: string | null;
                category: import(".prisma/client").$Enums.ShopCategory;
                price: number;
                inStock: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            price: number;
            quantity: number;
            orderId: string;
            shopItemId: string;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        total: number;
        qrCode: string | null;
        orderNumber: string;
        subtotal: number;
        serviceFee: number;
        platformFee: number;
        merchantAmount: number | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentRef: string | null;
        pickedUpAt: Date | null;
        settledAt: Date | null;
        pickupLocationId: string | null;
    }>;
    validatePickup(dto: ValidatePickupDto): Promise<{
        valid: boolean;
        message: string;
        pickedUpAt?: undefined;
        status?: undefined;
        order?: undefined;
    } | {
        valid: boolean;
        message: string;
        pickedUpAt: Date | null;
        status?: undefined;
        order?: undefined;
    } | {
        valid: boolean;
        message: string;
        status: "CANCELLED" | "PENDING" | "REFUNDED";
        pickedUpAt?: undefined;
        order?: undefined;
    } | {
        valid: boolean;
        message: string;
        order: {
            orderNumber: string;
            items: {
                name: string;
                quantity: number;
            }[];
            customer: string;
            pickupLocation: string | undefined;
        };
        pickedUpAt?: undefined;
        status?: undefined;
    }>;
}
