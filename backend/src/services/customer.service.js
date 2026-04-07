const customerRepository = require('../repositories/customer.repository');
const AppError = require('../utils/AppError');

class CustomerService {
    async getAllCustomers() {
        return await customerRepository.findAll();
    }

    async createCustomer(data) {
        const existing = await customerRepository.findByPhone(data.phone);
        if (existing) {
            throw new AppError('Customer with this phone already exists', 400);
        }
        return await customerRepository.create(data);
    }
}

module.exports = new CustomerService();
