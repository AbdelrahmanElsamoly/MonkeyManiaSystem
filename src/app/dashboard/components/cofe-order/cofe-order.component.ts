// cofe-order.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
  tap,
  catchError,
  takeUntil,
} from 'rxjs';
import { DashboardService } from '../../dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { CacheService, CacheManager } from '../../cashe.service'; // Fixed import path
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

// Your interfaces remain the same...
interface Child {
  id: number;
  name: string;
  phone_numbers: Array<{
    phone_number: string;
    relationship: string;
  }>;
}

interface ActiveBill {
  id: number;
  cash: string;
  instapay: string;
  visa: string;
  is_subscription: boolean;
  time_price: number;
  products_price: string;
  children: Child[];
  discount_value: string;
  discount_type: string | null;
  branch: string;
  product_bills_set: any[];
  is_active: boolean;
  hour_price: string;
  half_hour_price: string;
  total_price: number;
  spent_time: number;
  children_count: number;
  money_unbalance: number;
  finished: string | null;
  created: string;
  updated: string;
  created_by: string;
  finished_by: string | null;
  created_by_id: number;
  finished_by_id: number | null;
  branch_id: number;
}

interface Product {
  layer1: string;
  layer2: string;
  layer3: string;
  name: string;
  product: string;
  branch: string;
  warning_units: number;
  available_units: number;
  warning_message: string | null;
  sold_units: number;
  price: string;
  material_consumptions_set: Array<{
    id: number;
    material: string;
    consumption: string;
    measure_unit: string;
  }>;
  created: string;
  updated: string;
  created_by: string;
  created_by_id: number;
  product_id: number;
  branch_id: number;
  id: number;
}

interface OrderItem {
  product_type: string;
  product_id: number;
  quantity: number;
  id: number;
  notes: string;
  product?: Product;
}

@Component({
  selector: 'app-cofe-order',
  templateUrl: './cofe-order.component.html',
  styleUrls: ['./cofe-order.component.scss'],
})
export class CofeOrderComponent implements OnInit, OnDestroy {
  // Cache instances - now using the singleton service with 24-hour TTL
  private layer1Cache: CacheManager<string[]>;
  private layer2Cache: CacheManager<string[]>;
  private productsCache: CacheManager<Product[]>;
  private destroy$ = new Subject<void>();

  // All your existing properties...
  searchTerm: string = '';
  searchResults: ActiveBill[] = [];
  allActiveBills: ActiveBill[] = [];
  selectedBill: ActiveBill | null = null;
  showDropdown: boolean = false;
  searchLoading: boolean = false;

  tableNumber: number | null = null;
  takeAway: boolean = false;

  currentStep: number = 1;
  layer1Options: string[] = [];
  layer2Options: string[] = [];
  finalProducts: Product[] = [];

  selectedLayer1: string = '';
  selectedLayer2: string = '';
  selectedProduct: Product | null = null;

  showProductModal: boolean = false;
  currentQuantity: number = 1;
  currentNotes: string = '';

  orderItems: OrderItem[] = [];
  loading: boolean = false;
  loadingLayer: boolean = false;

  branchId: number = (() => {
    const branch = JSON.parse(localStorage.getItem('branch') || '{}');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return branch?.id || user?.branch || 0; // Default to 0 if both are undefined
  })();

  private searchSubject = new Subject<string>();

  constructor(
    private dashboardService: DashboardService,
    private toaster: ToastrService,
    private cacheService: CacheService, // Inject the cache service
    private translate: TranslateService,
    private dialog: MatDialog,
    private router: Router
  ) {
    // Initialize cache managers using the singleton service with 24-hour TTL and persistence
    this.layer1Cache = this.cacheService.getCache<string[]>('cafe_layer1', {
      persistToLocalStorage: true, // Enable persistence - uses 24-hour TTL from service
    });

    this.layer2Cache = this.cacheService.getCache<string[]>('cafe_layer2', {
      maxSize: 50,
      persistToLocalStorage: true, // Enable persistence - uses 24-hour TTL from service
    });

    this.productsCache = this.cacheService.getCache<Product[]>(
      'cafe_products',
      {
        maxSize: 50,
        persistToLocalStorage: false, // Don't persist products (inventory changes frequently)
      }
    );
  }

  ngOnInit(): void {
    this.loadActiveBills();
    this.loadLayer1();
    this.setupSearch();

    console.log(
      'Cache loaded from previous session:',
      this.cacheService.getAllCacheStats()
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // No need to save cache manually - it's handled by the service
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.performSearch(searchTerm);
      });
  }

  loadActiveBills(): void {
    this.dashboardService
      .getActiveBills(this.branchId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bills: any) => {
          this.allActiveBills = bills;
        },
        error: (error: any) => {
          console.error('Error loading active bills:', error);
          this.toaster.error('Failed to load active bills');
        },
      });
  }

  loadLayer1(): void {
    const cacheKey = `layer1_${this.branchId}`;
    const cachedData = this.layer1Cache.get(cacheKey);

    if (cachedData) {
      console.log('Layer1: Using cached data (persisted across sessions)');
      this.layer1Options = cachedData;
      return;
    }

    console.log('Layer1: Fetching from server');
    this.loadingLayer = true;

    this.dashboardService
      .getLayer1Products(this.branchId)
      .pipe(
        tap((data: any) => {
          this.layer1Cache.set(cacheKey, data);
        }),
        catchError((error) => {
          console.error('Error loading layer1:', error);
          this.toaster.error('Failed to load categories');
          return of([]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (layer1Data: any) => {
          this.layer1Options = layer1Data;
          this.loadingLayer = false;
        },
      });
  }

  private loadLayer2(layer1: string): void {
    const cacheKey = `layer2_${this.branchId}_${layer1}`;
    const cachedData = this.layer2Cache.get(cacheKey);

    if (cachedData) {
      console.log(`Layer2 (${layer1}): Using cached data (persisted)`);
      this.layer2Options = cachedData;
      return;
    }

    console.log(`Layer2 (${layer1}): Fetching from server`);
    this.loadingLayer = true;

    this.dashboardService
      .getLayer2Products(this.branchId, layer1)
      .pipe(
        tap((data: any) => {
          this.layer2Cache.set(cacheKey, data);
        }),
        catchError((error) => {
          console.error('Error loading layer2:', error);
          this.toaster.error('Failed to load subcategories');
          return of([]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (layer2Data: any) => {
          this.layer2Options = layer2Data;
          this.loadingLayer = false;
        },
      });
  }

  private loadFinalProducts(layer1: string, layer2: string): void {
    const cacheKey = `products_${this.branchId}_${layer1}_${layer2}`;
    const cachedData = this.productsCache.get(cacheKey);

    if (cachedData) {
      console.log(`Products (${layer1}/${layer2}): Using cached data`);
      this.finalProducts = cachedData;
      return;
    }

    console.log(`Products (${layer1}/${layer2}): Fetching from server`);
    this.loadingLayer = true;

    this.dashboardService
      .getFinalProducts(this.branchId, layer1, layer2)
      .pipe(
        tap((data: any) => {
          this.productsCache.set(cacheKey, data);
        }),
        catchError((error) => {
          console.error('Error loading products:', error);
          this.toaster.error('Failed to load products');
          return of([]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (products: any) => {
          this.finalProducts = products;
          this.loadingLayer = false;
        },
      });
  }

  // Search methods
  onSearchInput(event: any): void {
    const value = event.target.value;
    this.searchTerm = value;
    this.searchSubject.next(value);
    this.showDropdown = value.length > 0;
  }

  private performSearch(term: string): void {
    if (!term.trim()) {
      this.searchResults = [];
      this.searchLoading = false;
      return;
    }

    this.searchLoading = true;

    // Simulate async search with a small delay to show spinner
    setTimeout(() => {
      this.searchResults = this.allActiveBills.filter((bill) =>
        bill.children.some((child) =>
          child.name.toLowerCase().includes(term.toLowerCase())
        )
      );
      this.searchLoading = false;
    }, 100);
  }

  selectBill(bill: ActiveBill): void {
    this.selectedBill = bill;
    this.searchTerm = `Bill #${bill.id} - ${bill.children
      .map((c) => c.name)
      .join(', ')}`;
    this.showDropdown = false;
  }

  // Layer selection methods
  selectLayer1(category: string): void {
    this.layer2Options = [];
    this.finalProducts = [];
    this.selectedLayer2 = '';

    this.selectedLayer1 = category;
    this.currentStep = 2;
    this.loadLayer2(category);
  }

  selectLayer2(subcategory: string): void {
    this.finalProducts = [];

    this.selectedLayer2 = subcategory;
    this.currentStep = 3;
    this.loadFinalProducts(this.selectedLayer1, subcategory);
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.currentQuantity = 1;
    this.currentNotes = '';
    this.showProductModal = true;
  }

  // Product modal methods
  closeProductModal(): void {
    this.showProductModal = false;
    this.selectedProduct = null;
  }

  increaseQuantity(): void {
    if (
      this.selectedProduct &&
      this.currentQuantity < this.selectedProduct.available_units
    ) {
      this.currentQuantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.currentQuantity > 1) {
      this.currentQuantity--;
    }
  }

  addToOrder(): void {
    if (this.selectedProduct) {
      const orderItem: OrderItem = {
        product_type: 'product',
        product_id: this.selectedProduct.product_id,
        id: this.selectedProduct.id,
        quantity: this.currentQuantity,
        notes: this.currentNotes ? this.currentNotes : '--',
        product: this.selectedProduct,
      };

      this.orderItems.push(orderItem);
      this.closeProductModal();

      this.toaster.success(
        `Added ${this.currentQuantity}x ${this.selectedProduct.name} to order`
      );
    }
  }

  removeFromOrder(index: number): void {
    const removed = this.orderItems.splice(index, 1)[0];
    if (removed && removed.product) {
      this.toaster.info(
        `Removed ${removed.product.name} from order completely`
      );
    }
  }

  // Navigation methods
  continueOrdering(): void {
    this.currentStep = 1;
    this.selectedLayer1 = '';
    this.selectedLayer2 = '';
    this.layer2Options = [];
    this.finalProducts = [];
  }

  goBack(): void {
    if (this.currentStep === 3) {
      this.currentStep = 2;
      this.selectedLayer2 = '';
      this.finalProducts = [];
    } else if (this.currentStep === 2) {
      this.currentStep = 1;
      this.selectedLayer1 = '';
      this.selectedLayer2 = '';
      this.layer2Options = [];
      this.finalProducts = [];
    }
  }

  // Order management
  getOrderTotal(): number {
    return this.orderItems.reduce((total, item) => {
      return total + parseFloat(item.product?.price || '0') * item.quantity;
    }, 0);
  }

  submitOrder(): void {
    if (
      !this.selectedBill ||
      !this.tableNumber ||
      this.orderItems.length === 0
    ) {
      this.toaster.warning(this.translate.instant('PLEASE_SELECT_BILL'));
      return;
    }

    this.loading = true;

    const orderPayload = {
      products: this.orderItems.map((item) => ({
        product_type: item.product_type,
        product_id: item.id,
        quantity: item.quantity,
        notes: item.notes,
      })),
      bill: this.selectedBill.id,
      table_number: this.tableNumber,
      take_away: this.takeAway,
    };

    this.dashboardService
      .createProductBill(orderPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Order submitted successfully:', response);
          this.toaster.success(
            response.message || 'Order submitted successfully'
          );

          // Clear products cache after successful order
          this.productsCache.clear();

          // Open the bill dialog with the returned product bill ID
          this.openBillDialog(response.id);

          this.resetForm();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error submitting order:', error);
          this.toaster.error('Error submitting order. Please try again.');
          this.loading = false;
        },
      });
  }

  // Add this new method to open the dialog:
  openBillDialog(productBillId: number): void {
    this.router.navigate(['/dashboard/cofe-bill', productBillId]);
  }

  private resetForm(): void {
    this.selectedBill = null;
    this.searchTerm = '';
    this.tableNumber = null;
    this.takeAway = false;
    this.orderItems = [];
    this.currentStep = 1;
    this.selectedLayer1 = '';
    this.selectedLayer2 = '';
    this.layer2Options = [];
    this.finalProducts = [];

    this.loadActiveBills();
  }

  // Cache management methods
  forceRefreshLayer1(): void {
    const cacheKey = `layer1_${this.branchId}`;
    this.layer1Cache.clear();
    this.loadLayer1();
  }

  forceRefreshLayer2(): void {
    if (this.selectedLayer1) {
      this.layer2Cache.clearPattern(
        `layer2_${this.branchId}_${this.selectedLayer1}`
      );
      this.loadLayer2(this.selectedLayer1);
    }
  }

  forceRefreshProducts(): void {
    if (this.selectedLayer1 && this.selectedLayer2) {
      const cacheKey = `products_${this.branchId}_${this.selectedLayer1}_${this.selectedLayer2}`;
      this.productsCache.clearPattern(cacheKey);
      this.loadFinalProducts(this.selectedLayer1, this.selectedLayer2);
    }
  }

  // Utility method for images
  getFoodImage(itemName: string): string {
    const layer1ImageMap: { [key: string]: string } = {
      // Arabic mappings for your layer1 items
      اخري: 'https://tse2.mm.bing.net/th/id/OIP.pDBNDkwfB67QnmasFRfC9wHaFj?rs=1&pid=ImgDetMain&o=7&rm=3', // Other/Miscellaneous
      ديزيرت:
        'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop', // Dessert
      'معجنات حلوة':
        'https://tse1.mm.bing.net/th/id/OIP.oRZelOfrswAzBbOCcetRFwHaFF?rs=1&pid=ImgDetMain&o=7&rm=3', // Sweet pastries
      سناكس: 'https://bing.com/th?id=OSK.f2b015ee0a7fd3f507118faf168de27f', // Snacks
      'مشروبات باردة':
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop', // Cold drinks
      قهوة: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop', // Coffee
      'مشروبات ساخنة':
        'https://bing.com/th?id=OSK.5fd94c4692c9435341ad828764185d04', // Hot drinks

      // English mappings (keeping for compatibility)
      other:
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop',
      dessert:
        'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop',
      pastries:
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop',
      snacks:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
      'cold drinks':
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop',
      beverages:
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop',
      coffee:
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop',
      'hot drinks':
        'https://images.unsplash.com/photo-1556881286-04ba2dd9399d?w=300&h=200&fit=crop',
      tea: 'https://images.unsplash.com/photo-1556881286-04ba2dd9399d?w=300&h=200&fit=crop',

      // Additional food items
      burger:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
      pizza:
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
      sides:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
      salads:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
      wraps:
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
      fries:
        'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=300&h=200&fit=crop',
      fadge:
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop',
      nutella:
        'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop',
      chocolate:
        'https://images.unsplash.com/photo-1549924231-f129b911e442?w=300&h=200&fit=crop',
    };

    // Normalize the input by trimming whitespace
    const normalizedInput = itemName?.trim() || '';

    // Try direct match first for layer1 items
    if (layer1ImageMap[normalizedInput]) {
      return layer1ImageMap[normalizedInput];
    }

    // Try partial matching for Arabic keywords to ensure consistency
    for (const [key, value] of Object.entries(layer1ImageMap)) {
      if (normalizedInput.includes(key) || key.includes(normalizedInput)) {
        return value;
      }
    }

    // Arabic keyword partial matching for robust detection
    if (
      normalizedInput.includes('مشروبات') &&
      normalizedInput.includes('ساخنة')
    ) {
      return layer1ImageMap['مشروبات ساخنة'];
    }
    if (
      normalizedInput.includes('مشروبات') &&
      normalizedInput.includes('باردة')
    ) {
      return layer1ImageMap['مشروبات باردة'];
    }
    if (normalizedInput.includes('قهوة')) {
      return layer1ImageMap['قهوة'];
    }
    if (normalizedInput.includes('ديزيرت')) {
      return layer1ImageMap['ديزيرت'];
    }
    if (normalizedInput.includes('معجنات')) {
      return layer1ImageMap['معجنات حلوة'];
    }
    if (normalizedInput.includes('سناكس')) {
      return layer1ImageMap['سناكس'];
    }
    if (normalizedInput.includes('اخري')) {
      return layer1ImageMap['اخري'];
    }

    // Default image for unmatched items
    return 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop';
  }

  // Debug method to check cache status across sessions
  getCacheDebugInfo(): void {
    console.log('All Cache Statistics:', this.cacheService.getAllCacheStats());
    console.log('Layer1 Cache:', this.layer1Cache.getStats());
    console.log('Layer2 Cache:', this.layer2Cache.getStats());
    console.log('Products Cache:', this.productsCache.getStats());
  }

  // Method to manually clear all caches if needed
  clearAllCaches(): void {
    this.cacheService.clearAllCaches();
    console.log('All caches cleared (including localStorage)');
  }

  increaseOrderItemQuantity(index: number): void {
    const item = this.orderItems[index];
    if (item && item.product && item.quantity < item.product.available_units) {
      item.quantity++;
      this.toaster.success(
        `${item.product.name} quantity increased to ${item.quantity}`
      );
    } else if (item && item.product) {
      this.toaster.warning(
        `Maximum available quantity reached for ${item.product.name}`
      );
    }
  }

  /**
   * Decrease quantity of an order item or remove if quantity becomes 1
   */
  decreaseOrderItemQuantity(index: number): void {
    const item = this.orderItems[index];
    if (!item || !item.product) return;

    if (item.quantity === 1) {
      // Remove the item completely when quantity is 1
      this.removeFromOrder(index);
    } else {
      // Decrease quantity
      item.quantity--;
      this.toaster.info(
        `${item.product.name} quantity decreased to ${item.quantity}`
      );
    }
  }
}
