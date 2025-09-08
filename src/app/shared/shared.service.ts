import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor(private http: HttpClient) {}

  // Get Branches Api
  getBranches() {
    return this.http.get(`branch/all/`);
  }

  getMaterials(branchId: any) {
    return this.http.get(`branch_material/all?branch_id=${branchId}`);
  }
  getAllNonActiveChildren(search: string) {
    const params = new HttpParams().set('search', search);
    return this.http.get(`child/non_active/all/`, { params });
  }
  createBill(body: any) {
    return this.http.post(`bill/create/`, body);
  }
  ApplyPromoCode(billId: number, discount: string) {
    return this.http.patch(`bill/${billId}/apply_discount/`, {
      discount,
    });
  }
  getBillDetails(billId: number) {
    return this.http.get(`product_bill/${billId}/`);
  }
}
