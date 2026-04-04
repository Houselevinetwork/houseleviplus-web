const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const shopApi = {
  products: {
    list: async (skip = 0, limit = 10) => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/products?skip=${skip}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
    
    getById: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/products/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Product not found');
      return res.json();
    },
    
    create: async (data: any) => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create product');
      return res.json();
    },
    
    update: async (id: string, data: any) => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update product');
      return res.json();
    },
    
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to delete product');
      return res.json();
    },
    
    publish: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/products/${id}/publish`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to publish product');
      return res.json();
    }
  },
  
  orders: {
    list: async (skip = 0, limit = 10, status?: string) => {
      const url = status 
        ? `${API_BASE_URL}/admin/commerce/orders?skip=${skip}&limit=${limit}&status=${status}`
        : `${API_BASE_URL}/admin/commerce/orders?skip=${skip}&limit=${limit}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    
    getById: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/orders/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Order not found');
      return res.json();
    },
    
    updateStatus: async (id: string, status: string) => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ orderStatus: status })
      });
      if (!res.ok) throw new Error('Failed to update order status');
      return res.json();
    },
    
    addTracking: async (id: string, trackingNumber: string, trackingUrl: string) => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/orders/${id}/tracking`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ trackingNumber, trackingUrl })
      });
      if (!res.ok) throw new Error('Failed to add tracking');
      return res.json();
    },
    
    stats: async () => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/orders/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
  },
  
  collections: {
    list: async () => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/collections`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch collections');
      return res.json();
    },
    
    getById: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/collections/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Collection not found');
      return res.json();
    },
    
    create: async (data: any) => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create collection');
      return res.json();
    },
    
    update: async (id: string, data: any) => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/collections/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update collection');
      return res.json();
    }
  },
  
  shipping: {
    list: async () => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/shipping`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch shipping rates');
      return res.json();
    },
    
    update: async (location: string, data: any) => {
      const res = await fetch(`${API_BASE_URL}/admin/commerce/shipping/${location}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update shipping rate');
      return res.json();
    }
  }
};

function getToken() {
  // TODO: Implement token retrieval from cookies/storage
  return typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';
}
