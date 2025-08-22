import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  // schools Api
  getSchools(searchQuery: string = '') {
    let params = {};
    if (searchQuery) {
      params = { params: { search: searchQuery } };
    }

    return this.http.get(`school/all/`, params);
  }

  createSchool(schoolData: any) {
    return this.http.post(`school/create/`, schoolData);
  }

  updateSchool(schoolId: string, schoolData: any) {
    return this.http.put(`school/${schoolId}/update/`, schoolData);
  }
  getSchoolById(schoolId: string) {
    return this.http.get(`school/${schoolId}/`);
  }

  uploadBulkSchool(file: any) {
    return this.http.post(`school/bulk_create/`, file);
  }
  // mainpAge Api
  getStatistics(branchId: any) {
    let params = {};
    if (branchId) {
      params = new HttpParams().set('branch_id', branchId);
      return this.http.get(`dashboard/statistics`, { params });
    } else if (branchId == null) {
      return this.http.get(`dashboard/statistics`);
    }
    // Default return to handle all code paths
    return this.http.get(`dashboard/statistics`);
  }

  // children Api
  getChild(searchQuery: string = '', page: number) {
    let params = new HttpParams().set('page', page);
    if (searchQuery) {
      params = params.set('search', searchQuery);
    }

    return this.http.get(`child/all/`, { params });
  }
  getChildById(childId: any) {
    return this.http.get(`child/${childId}/`);
  }

  createChild(body: any) {
    return this.http.post(`child/create/`, body);
  }

  updateChild(childId: any, body: any) {
    return this.http.put(`child/${childId}/update/`, body);
  }
  // user Api
  getUsers(
    searchQuery: string = '',
    branchIds: any[] = [],
    page: number
  ): Observable<any> {
    let params = new HttpParams();
    params = params.set('page', page);
    if (searchQuery) {
      params = params.set('search', searchQuery);
    }

    if (!branchIds || branchIds.length === 0) {
      // 👉 No branches selected, treat it as "all"
      params = params.set('branch_id', 'all');
    } else {
      // 👇 Append each branch_id individually
      branchIds.forEach((id) => {
        params = params.append('branch_id', id.toString());
      });
    }

    return this.http.get(`user/all/`, { params });
  }
  getUserById(userId: any) {
    return this.http.get(`user/${userId}/`);
  }

  // Expense
  getExpenses(type: any, paramsOj: any) {
    let params = new HttpParams();
    if (paramsOj.page) {
      params = params.set('page', paramsOj.page);
    }
    if (paramsOj.searchQuery) {
      params = params.set('search', paramsOj.searchQuery);
    }
    if (!paramsOj.branchIds || paramsOj.branchIds.length === 0) {
      params = params.set('branch_id', 'all');
    } else {
      paramsOj.branchIds.forEach((id: any) => {
        params = params.append('branch_id', id.toString());
      });
    }
    if (paramsOj.startDate && paramsOj.endDate) {
      params = params.set('start_date', paramsOj.startDate);
      params = params.set('end_date', paramsOj.endDate);
    }
    return this.http.get(`${type}/all/`, { params });
  }

  getMaterialExpenseById(id: number): Observable<any> {
    return this.http.get(`material_expense/${id}/`);
  }

  getGeneralExpenseById(id: number): Observable<any> {
    return this.http.get(`general_expense/${id}/`);
  }

  createGeneralExpense(data: any): Observable<any> {
    return this.http.post(`general_expense/create/`, data);
  }

  createMaterialExpense(data: any): Observable<any> {
    return this.http.post(`material_expense/create/`, data);
  }

  updateGeneralExpense(id: number, body: any) {
    return this.http.put(`general_expense/${id}/update/`, body);
  }

  updateMaterialExpense(id: number, body: any) {
    return this.http.put(`material_expense/${id}/update/`, body);
  }

  // bills Api
  getChildrenBills(type: any, paramsOj: any) {
    let params = new HttpParams();
    if (paramsOj.page) {
      params = params.set('page', paramsOj.page);
    }

    if (paramsOj.searchQuery) {
      params = params.set('search', paramsOj.searchQuery);
    }
    if (!paramsOj.branchIds || paramsOj.branchIds.length === 0) {
      params = params.set('branch_id', 'all');
    } else {
      paramsOj.branchIds.forEach((id: any) => {
        params = params.append('branch_id', id.toString());
      });
    }
    if (paramsOj.startDate && paramsOj.endDate) {
      params = params.set('start_date', paramsOj.startDate);
      params = params.set('end_date', paramsOj.endDate);
    }
    return this.http.get(`bill${type}all/`, { params });
  }
  getChildBillById(billId: any) {
    return this.http.get(`bill/${billId}/`);
  }
  closeBill(id: any, body: any) {
    return this.http.patch(`bill/${id}/close/`, body);
  }

  // Cafe Order APIs
  getActiveBills(branchId: number): Observable<any> {
    const params = new HttpParams().set('branch_id', branchId.toString());
    return this.http.get(`bill/active/all`, { params });
  }

  getLayer1Products(branchId: number): Observable<any> {
    const params = new HttpParams().set('branch_id', branchId.toString());
    return this.http.get(`branch_product/layer1`, { params });
  }

  getLayer2Products(branchId: number, layer1: string): Observable<any> {
    const params = new HttpParams()
      .set('branch_id', branchId.toString())
      .set('layer1', layer1);
    return this.http.get(`branch_product/layer2`, { params });
  }

  getFinalProducts(
    branchId: number,
    layer1: string,
    layer2: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('branch_id', branchId.toString())
      .set('layer1', layer1)
      .set('layer2', layer2);
    return this.http.get(`branch_product/all`, { params });
  }

  createProductBill(orderData: any): Observable<any> {
    return this.http.post(`product_bill/create/`, orderData);
  }

  // cafe Bills Api
  getCafeBill(type: any, paramsOj: any) {
    let params = new HttpParams();
    if (paramsOj.page) {
      params = params.set('page', paramsOj.page);
    }

    if (paramsOj.searchQuery) {
      params = params.set('search', paramsOj.searchQuery);
    }
    if (!paramsOj.branchIds || paramsOj.branchIds.length === 0) {
      params = params.set('branch_id', 'all');
    } else {
      paramsOj.branchIds.forEach((id: any) => {
        params = params.append('branch_id', id.toString());
      });
    }
    if (paramsOj.startDate && paramsOj.endDate) {
      params = params.set('start_date', paramsOj.startDate);
      params = params.set('end_date', paramsOj.endDate);
    }
    return this.http.get(`product_bill${type}all/`, { params });
  }

  getBillDetails(billId: number) {
    return this.http.get(`/product_bill/${billId}/`);
  }

  // Update bill
  updateBill(billId: number, payload: any) {
    return this.http.patch(`/product_bill/${billId}/update/`, payload);
  }
}
