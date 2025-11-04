import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvestmentsService } from './investments.service';
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductsQueryDto,
} from './dto/product.dto';
import {
  PurchaseInvestmentDto,
  RedeemInvestmentDto,
  GetInvestmentsQueryDto,
  UpdateNavDto,
  GetNavHistoryDto,
} from './dto/investment.dto';
import {
  ProductResponseDto,
  ProductsListResponseDto,
  InvestmentResponseDto,
  InvestmentsListResponseDto,
  PurchaseResponseDto,
  RedemptionResponseDto,
  PortfolioResponseDto,
  NavHistoryResponseDto,
} from './dto/investment-response.dto';

@ApiTags('Investments')
@Controller('investments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  // ============================================
  // PRODUCT CATALOG ENDPOINTS
  // ============================================

  @Post('products')
  @ApiOperation({ summary: 'Create new investment product (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Product already exists' })
  async createProduct(
    @Body() createDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.investmentsService.createProduct(createDto);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get all investment products with filters' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: ProductsListResponseDto,
  })
  async getProducts(
    @Query() query: GetProductsQueryDto,
  ): Promise<ProductsListResponseDto> {
    return this.investmentsService.getProducts(query);
  }

  @Get('products/:productId')
  @ApiOperation({ summary: 'Get single investment product details' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product details retrieved',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProduct(
    @Param('productId') productId: string,
  ): Promise<ProductResponseDto> {
    return this.investmentsService.getProduct(productId);
  }

  @Put('products/:productId')
  @ApiOperation({ summary: 'Update investment product (Admin)' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProduct(
    @Param('productId') productId: string,
    @Body() updateDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.investmentsService.updateProduct(productId, updateDto);
  }

  @Delete('products/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete investment product (Admin)' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete product with active investments',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(
    @Param('productId') productId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.investmentsService.deleteProduct(productId);
  }

  // ============================================
  // INVESTMENT PURCHASE & REDEMPTION
  // ============================================

  @Post('purchase')
  @ApiOperation({
    summary: 'Purchase investment from savings wallet',
    description:
      'Invest from savings wallet into selected product. Amount is deducted from savings balance.',
  })
  @ApiResponse({
    status: 201,
    description: 'Investment purchased successfully',
    type: PurchaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient balance or invalid product',
  })
  @ApiResponse({ status: 404, description: 'Product or wallet not found' })
  async purchaseInvestment(
    @Request() req,
    @Body() purchaseDto: PurchaseInvestmentDto,
  ): Promise<PurchaseResponseDto> {
    return this.investmentsService.purchaseInvestment(
      req.user.userId,
      purchaseDto,
    );
  }

  @Post('redeem')
  @ApiOperation({
    summary: 'Redeem investment (full or partial)',
    description:
      'Redeem investment and transfer amount back to savings wallet. Exit load will be applied if applicable.',
  })
  @ApiResponse({
    status: 200,
    description: 'Investment redeemed successfully',
    type: RedemptionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid redemption request',
  })
  @ApiResponse({ status: 404, description: 'Investment not found' })
  async redeemInvestment(
    @Request() req,
    @Body() redeemDto: RedeemInvestmentDto,
  ): Promise<RedemptionResponseDto> {
    return this.investmentsService.redeemInvestment(req.user.userId, redeemDto);
  }

  // ============================================
  // PORTFOLIO MANAGEMENT
  // ============================================

  @Get('my-investments')
  @ApiOperation({
    summary: 'Get user investments with filters',
    description: 'Get all investments for the authenticated user with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Investments retrieved successfully',
    type: InvestmentsListResponseDto,
  })
  async getMyInvestments(
    @Request() req,
    @Query() query: GetInvestmentsQueryDto,
  ): Promise<InvestmentsListResponseDto> {
    return this.investmentsService.getUserInvestments(req.user.userId, query);
  }

  @Get('my-investments/:investmentId')
  @ApiOperation({ summary: 'Get single investment details' })
  @ApiParam({ name: 'investmentId', description: 'Investment ID' })
  @ApiResponse({
    status: 200,
    description: 'Investment details retrieved',
    type: InvestmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Investment not found' })
  async getInvestmentDetails(
    @Request() req,
    @Param('investmentId') investmentId: string,
  ): Promise<InvestmentResponseDto> {
    const investments = await this.investmentsService.getUserInvestments(
      req.user.userId,
      { page: 1, limit: 1 },
    );
    const investment = investments.data.find((inv) => inv.id === investmentId);

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    return investment;
  }

  @Get('portfolio')
  @ApiOperation({
    summary: 'Get complete investment portfolio',
    description:
      'Get comprehensive portfolio overview with summary, breakdown by category, and top performers',
  })
  @ApiResponse({
    status: 200,
    description: 'Portfolio retrieved successfully',
    type: PortfolioResponseDto,
  })
  async getPortfolio(@Request() req): Promise<PortfolioResponseDto> {
    return this.investmentsService.getPortfolio(req.user.userId);
  }

  // ============================================
  // NAV MANAGEMENT
  // ============================================

  @Post('nav/update')
  @ApiOperation({
    summary: 'Update product NAV (Admin)',
    description: 'Update or create NAV for a product on a specific date',
  })
  @ApiResponse({
    status: 200,
    description: 'NAV updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateNav(
    @Body() updateDto: UpdateNavDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.investmentsService.updateNav(updateDto);
  }

  @Get('nav/history')
  @ApiOperation({
    summary: 'Get NAV history for a product',
    description: 'Get historical NAV data with summary statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'NAV history retrieved successfully',
    type: NavHistoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product or NAV history not found' })
  async getNavHistory(
    @Query() query: GetNavHistoryDto,
  ): Promise<NavHistoryResponseDto> {
    return this.investmentsService.getNavHistory(query);
  }
}
