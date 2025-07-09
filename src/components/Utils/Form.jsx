import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { ChevronDown } from "lucide-react";

const Form = ({
  isOpen,
  onClose,
  onSubmit,
  formType, // 'transaction', 'note', 'budget', 'asset'
  data = null,
  isEditing = false,
  selectedMonth = 'July' // for budget form
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [dropdownStates, setDropdownStates] = useState({
    type: false,
    category: false,
    method: false,
    currency: false
  });
  const [isClosing, setIsClosing] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const formConfigs = {
    transaction: {
      title: 'Transaction',
      fields: ['date', 'type', 'name', 'category', 'method', 'amount'],
      initialData: {
        date: new Date().toISOString().split('T')[0],
        type: '',
        name: '',
        category: '',
        method: '',
        amount: ''
      }
    },
    note: {
      title: 'Note',
      fields: ['heading', 'content'],
      initialData: {
        heading: '',
        content: ''
      }
    },
    budget: {
      title: 'Budget',
      fields: ['category', 'amount'],
      initialData: {
        category: '',
        amount: ''
      }
    },
    asset: {
      title: 'Asset',
      fields: ['name', 'currency', 'amount', 'notes'],
      initialData: {
        name: '',
        currency: 'AED',
        amount: '',
        notes: ''
      }
    }
  };

  const dropdownOptions = {
    type: ['Income', 'Expenditure'],
    category: ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Rent', 'Leisure', 'Grocery', 'Transport', 'Education', 'Insurance', 'Savings', 'Other'],
    method: ['Cash', 'RAK Bank', 'ADCB', 'Emirates NBD', 'FAB', 'Credit Card', 'Other'],
    currency: [
      { value: 'AED', label: 'AED', symbol: 'AED' },
      { value: 'INR', label: 'INR', symbol: '₹' },
      { value: '$', label: 'USD', symbol: '$' }
    ]
  };

  // opening animation
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setTimeout(() => setShowContent(true), 10);
    }
  }, [isOpen]);

  // initialise the form data
  useEffect(() => {
    if (isOpen && formType) {
      setLoading(false);
      setErrors({});
      const config = formConfigs[formType];

      if (isEditing && data) {
        // pre-fill form with existing data for editing
        if (formType === 'asset') {
          setFormData({
            id: data.id,
            name: data.name || '',
            currency: data.currency || 'AED',
            amount: data.amount ? data.amount.toString() : '',
            notes: data.notes || ''
          });
        } else if (formType === 'transaction') {
          setFormData({
            id: data.id,
            date: data.date || new Date().toISOString().split('T')[0],
            type: data.type || '',
            name: data.name || '',
            category: data.category || '',
            method: data.method || '',
            amount: data.amount ? data.amount.toString() : ''
          });
        } else if (formType === 'note') {
          setFormData({
            id: data.id,
            heading: data.heading || '',
            content: data.content || ''
          });
        } else if (formType === 'budget') {
          setFormData({
            id: data.id,
            category: data.category || '',
            amount: data.amount ? data.amount.toString() : ''
          });
        }
      } else {
        // initialise with default values for new entries
        setFormData({ ...config.initialData });
      }
    }
  }, [isOpen, isEditing, data, formType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownStates).forEach(key => {
        if (dropdownStates[key] && !event.target.closest(`.${key}-dropdown`)) {
          setDropdownStates(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownStates]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDropdownSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    setDropdownStates(prev => ({ ...prev, [field]: false }));
  };

  const validateForm = () => {
    const newErrors = {};

    const validateAmount = (value) => {
      if (!value?.trim()) return 'Amount is required';
      if (isNaN(value) || parseFloat(value) <= 0) {
        return 'Amount must be a positive number';
      }
      return null;
    };

    switch (formType) {
      case 'transaction':
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.type) newErrors.type = 'Type is required';
        if (!formData.name?.trim()) newErrors.name = 'Name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.method) newErrors.method = 'Method is required';

        const amountErrorTx = validateAmount(formData.amount);
        if (amountErrorTx) newErrors.amount = amountErrorTx;
        break;

      case 'note':
        if (!formData.heading?.trim()) newErrors.heading = 'Note title is required';
        if (!formData.content?.trim()) newErrors.content = 'Note content is required';
        break;

      case 'budget':
        if (!formData.category?.trim()) newErrors.category = 'Category is required';

        const amountErrorBudget = validateAmount(formData.amount);
        if (amountErrorBudget) newErrors.amount = amountErrorBudget;
        break;

      case 'asset':
        if (!formData.name?.trim()) newErrors.name = 'Asset name is required';
        if (!formData.currency) newErrors.currency = 'Currency is required';

        const amountErrorAsset = validateAmount(formData.amount);
        if (amountErrorAsset) newErrors.amount = amountErrorAsset;
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        ...(formData.amount && { amount: parseFloat(formData.amount) }),
        ...(isEditing && formData.id && { id: formData.id })
      };

      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          delete submitData[key];
        }
      });

      await onSubmit(submitData);

      setLoading(false);
      handleClose();

    } catch (error) {
      console.error(`Error submitting ${formType}:`, error);
      setLoading(false);

      setErrors({ submit: 'Failed to save. Please try again.' });
    }
  };

  const handleClose = () => {
    if (!loading) {
      setIsClosing(true);
      setShowContent(false);
      setLoading(false);
      setErrors({});
      setTimeout(() => onClose(), 200);
    }
  };

  const getCurrencySymbol = (currency) => {
    const currencyObj = dropdownOptions.currency.find(c => c.value === currency);
    return currencyObj ? currencyObj.symbol : currency;
  };

  const getFormDescription = () => {
    if (formType === 'transaction') {
      return isEditing ? 'Update the transaction details below.' : 'Enter the transaction details below.';
    } else if (formType === 'note') {
      return isEditing ? 'Update your note details.' : 'Create a new note to keep track of important information.';
    } else if (formType === 'budget') {
      return isEditing ? `Update the budget details for ${selectedMonth}.` : `Set a budget for ${selectedMonth}.`;
    } else if (formType === 'asset') {
      return isEditing ? 'Update the asset details below.' : 'Add a new asset to track your portfolio.';
    }
    return '';
  };

  const renderField = (fieldName) => {
    const commonInputProps = {
      id: fieldName,
      name: fieldName,
      value: formData[fieldName] || '',
      onChange: handleInputChange,
      className: "w-full px-4 py-2 bg-[#282828] border border-[#505050] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
    };

    switch (fieldName) {
      case 'date':
        return (
          <div>
            <label htmlFor="date" className="block text-md font-medium text-white mb-2">Date</label>
            <input {...commonInputProps} type="date" />
            {errors.date && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.date}</p>}
          </div>
        );

      case 'type':
        return (
          <div>
            <label htmlFor="type" className="block text-md font-medium text-white mb-2">Type</label>
            <div className="relative type-dropdown">
              <button
                type="button"
                onClick={() => setDropdownStates(prev => ({ ...prev, type: !prev.type }))}
                className="w-full px-4 py-2 pr-10 bg-[#282828] border border-[#505050] rounded-lg text-white text-left focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                {formData.type || 'Select type'}
              </button>
              <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownStates.type ? 'rotate-180' : ''}`} />

              {dropdownStates.type && (
                <div className="absolute top-full mt-1 w-full bg-[#282828] border border-[#505050] rounded-lg shadow-lg z-20 animate-slideDown">
                  {dropdownOptions.type.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleDropdownSelect('type', option)}
                      className={`w-full px-4 py-2 text-left text-white hover:bg-[#333] transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${formData.type === option ? 'bg-[#333]' : ''}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.type && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.type}</p>}
          </div>
        );

      case 'name':
        return (
          <div>
            <label htmlFor="name" className="block text-md font-medium text-white mb-2">
              {formType === 'transaction' ? 'Name' : 'Asset Name'}
            </label>
            <input
              {...commonInputProps}
              type="text"
              placeholder={formType === 'transaction' ? 'Transaction name' : 'Enter asset name'}
              maxLength={100}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.name}</p>}
          </div>
        );

      case 'heading':
        return (
          <div>
            <label htmlFor="heading" className="block text-md font-medium text-white mb-2">Note Title</label>
            <input {...commonInputProps} type="text" placeholder="Enter note title" maxLength={200} />
            {errors.heading && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.heading}</p>}
          </div>
        );

      case 'content':
        return (
          <div>
            <label htmlFor="content" className="block text-md font-medium text-white mb-2 mt-4">Note Content</label>
            <textarea
              {...commonInputProps}
              rows={8}
              placeholder="Write your note content here..."
              className={`${commonInputProps.className} resize-none`}
            />
            {errors.content && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.content}</p>}
          </div>
        );

      case 'notes':
        return (
          <div>
            <label htmlFor="notes" className="block text-md font-medium text-white mb-2">Notes</label>
            <textarea
              {...commonInputProps}
              rows={4}
              placeholder="Add any additional notes about this asset..."
              className={`${commonInputProps.className} resize-none`}
              maxLength={1000}
            />
            {errors.notes && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.notes}</p>}
          </div>
        );

      case 'category':
        return (
          <div>
            <label htmlFor="category" className="block text-md font-medium text-white mb-2">Category</label>
            <div className="relative category-dropdown">
              <input
                {...commonInputProps}
                type="text"
                onFocus={() => setDropdownStates(prev => ({ ...prev, category: true }))}
                placeholder="Select or type category"
                className="w-full px-4 py-2 pr-10 bg-[#282828] border border-[#505050] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                maxLength={50}
              />
              <button
                type="button"
                onClick={() => setDropdownStates(prev => ({ ...prev, category: !prev.category }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownStates.category ? 'rotate-180' : ''}`} />
              </button>

              {dropdownStates.category && (
                <div className="absolute top-full mt-1 w-full bg-[#282828] border border-[#505050] rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto animate-slideDown">
                  {dropdownOptions.category
                    .filter(option => option.toLowerCase().includes((formData.category || '').toLowerCase()))
                    .map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleDropdownSelect('category', option)}
                        className={`w-full px-4 py-2 text-left text-white hover:bg-[#333] transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${formData.category === option ? 'bg-[#333]' : ''}`}
                      >
                        {option}
                      </button>
                    ))}
                  {dropdownOptions.category.filter(option =>
                    option.toLowerCase().includes((formData.category || '').toLowerCase())
                  ).length === 0 && formData.category && (
                      <div className="px-4 py-2 text-gray-400 text-sm">No matching categories found</div>
                    )}
                </div>
              )}
            </div>
            {errors.category && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.category}</p>}
          </div>
        );

      case 'method':
        return (
          <div>
            <label htmlFor="method" className="block text-md font-medium text-white mb-2">Method</label>
            <div className="relative method-dropdown">
              <input
                {...commonInputProps}
                type="text"
                onFocus={() => setDropdownStates(prev => ({ ...prev, method: true }))}
                placeholder="Select or type method"
                className="w-full px-4 py-2 pr-10 bg-[#282828] border border-[#505050] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                maxLength={50}
              />
              <button
                type="button"
                onClick={() => setDropdownStates(prev => ({ ...prev, method: !prev.method }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownStates.method ? 'rotate-180' : ''}`} />
              </button>

              {dropdownStates.method && (
                <div className="absolute top-full mt-1 w-full bg-[#282828] border border-[#505050] rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto animate-slideDown">
                  {dropdownOptions.method
                    .filter(option => option.toLowerCase().includes((formData.method || '').toLowerCase()))
                    .map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleDropdownSelect('method', option)}
                        className={`w-full px-4 py-2 text-left text-white hover:bg-[#333] transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${formData.method === option ? 'bg-[#333]' : ''}`}
                      >
                        {option}
                      </button>
                    ))}
                  {dropdownOptions.method.filter(option =>
                    option.toLowerCase().includes((formData.method || '').toLowerCase())
                  ).length === 0 && formData.method && (
                      <div className="px-4 py-2 text-gray-400 text-sm">No matching methods found</div>
                    )}
                </div>
              )}
            </div>
            {errors.method && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.method}</p>}
          </div>
        );

      case 'currency':
        return (
          <div>
            <label htmlFor="currency" className="block text-md font-medium text-white mb-2 mt-2">Currency</label>
            <div className="relative currency-dropdown">
              <button
                type="button"
                onClick={() => setDropdownStates(prev => ({ ...prev, currency: !prev.currency }))}
                className="w-full px-4 py-2 pr-10 bg-[#282828] border border-[#505050] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-left"
              >
                {dropdownOptions.currency.find(c => c.value === formData.currency)?.label || 'Select currency'}
              </button>
              <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownStates.currency ? 'rotate-180' : ''}`} />

              {dropdownStates.currency && (
                <div className="absolute top-full mt-1 w-full bg-[#282828] border border-[#505050] rounded-lg shadow-lg z-20 animate-slideDown">
                  {dropdownOptions.currency.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleDropdownSelect('currency', option.value)}
                      className={`w-full px-4 py-2 text-left text-white hover:bg-[#333] transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${formData.currency === option.value ? 'bg-[#333]' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.currency && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.currency}</p>}
          </div>
        );

      case 'amount':
        const isAssetForm = formType === 'asset';
        const isBudgetForm = formType === 'budget';
        const currencySymbol = isAssetForm ? getCurrencySymbol(formData.currency) : 'AED';

        return (
          <div>
            <label htmlFor="amount" className="block text-md font-medium text-white mt-2 mb-2">
              {isAssetForm ? 'Asset Value' : isBudgetForm ? 'Budget Amount' : 'Amount'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-5.25 transform -translate-y-1/2 text-gray-400 text-sm">
                {currencySymbol}
              </span>
              <input
                {...commonInputProps}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-2 mb-2 bg-[#282828] border border-[#505050] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
            {errors.amount && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.amount}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen || !formType) return null;

  const config = formConfigs[formType];

  return (
    <div className={`fixed inset-0 bg-grey-400/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300 ${showContent ? 'opacity-100' : 'opacity-0'
      }`}>
      <div className="w-full max-w-md">
        <div className={`bg-[#202020] rounded-2xl p-8 border border-gray-700 transition-all duration-300 transform ${showContent && !isClosing
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4'
          }`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">
                {isEditing ? `Edit ${config.title}` : `Add ${config.title}`}
              </h1>
              <p className="text-gray-400">
                {getFormDescription()}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 mb-auto mt-2 hover:text-white transition-colors duration-200 hover:scale-110 transform"
              disabled={loading}
            >
              <FiX size={24} />
            </button>
          </div>

          <form className={`space-y-${formType === 'note' || formType === 'asset' ? '6' : '4'}`} onSubmit={handleSubmit}>
            {config.fields.map((field) => (
              <div key={field}>
                {renderField(field)}
              </div>
            ))}

            {/* Display submit error if any */}
            {errors.submit && (
              <div className="text-red-500 text-sm text-center animate-shake">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              className={`w-full mt-${formType === 'note' || formType === 'asset' ? '6' : '4'} bg-[#f8f9fa] hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] ${loading ? 'animate-pulse' : ''
                }`}
              disabled={loading}
            >
              {loading ?
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  {isEditing ? 'Updating...' :
                    formType === 'note' ? 'Creating...' : 'Adding...'
                  }
                </span> :
                (isEditing ? `Update ${config.title}` :
                  formType === 'note' ? `Create ${config.title}` : `Add ${config.title}`
                )
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Form;