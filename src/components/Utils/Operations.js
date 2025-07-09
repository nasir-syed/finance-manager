import { supabase } from '../../context/supabaseClient';


// ------------ ASSET OPERATIONS ------------

// fetch all assets for the current user
export const fetchAssets = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assets:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching assets:', error);
    return { success: false, error: error.message };
  }
};

// add a new asset
export const addAsset = async (assetData, userId) => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .insert([{
        user_id: userId,
        name: assetData.name,
        amount: assetData.amount,
        currency: assetData.currency
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding asset:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error adding asset:', error);
    return { success: false, error: error.message };
  }
};

// update an asset
export const updateAsset = async (assetId, assetData, userId) => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .update({
        name: assetData.name,
        amount: assetData.amount,
        currency: assetData.currency,
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating asset:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating asset:', error);
    return { success: false, error: error.message };
  }
};

// delete an asset
export const deleteAsset = async (assetId, userId) => {
  try {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting asset:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting asset:', error);
    return { success: false, error: error.message };
  }
};

// ------------ BUDGET OPERATIONS ------------

// fetch all budgets 
export const fetchBudgets = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching budgets:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return { success: false, error: error.message };
  }
};

// add a new budget
export const addBudget = async (budgetData, userId) => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .insert([{
        user_id: userId,
        category: budgetData.category,
        amount: budgetData.amount,
        month: budgetData.month,
        year: budgetData.year
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding budget:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error adding budget:', error);
    return { success: false, error: error.message };
  }
};

// update an budget
export const updateBudget = async (budgetId, budgetData, userId) => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .update({
        category: budgetData.category,
        amount: budgetData.amount,
        month: budgetData.month,
        year: budgetData.year,
        updated_at: new Date().toISOString()
      })
      .eq('id', budgetId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating budget:', error);
    return { success: false, error: error.message };
  }
};

// delete a budget
export const deleteBudget = async (budgetId, userId) => {
  try {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting budget:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting budget:', error);
    return { success: false, error: error.message };
  }
};

// fetch budgets for a specific month and year
export const fetchBudgetsByMonthYear = async (userId, month, year) => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching budgets by month/year:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching budgets by month/year:', error);
    return { success: false, error: error.message };
  }
};



// ------------ NOTES OPERATIONS ------------

// fetch all notes 
export const fetchNotes = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes for the user: ', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching notes: ', error)
    return { success: false, error: error.message }
  }
}

// add a note
export const addNote = async (noteData, userId) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        user_id: userId,
        heading: noteData.heading,
        content: noteData.content
      }])
      .select()
      .single()

    if (error) {
      console.error('Error adding note:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error adding note: ', error)
    return { success: false, error: error.message }
  }
}

// update a note 
export const updateNote = async (noteId, noteData, userId) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update({
        user_id: userId,
        heading: noteData.heading,
        content: noteData.content,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating note: ', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error updating note: ', error)
    return { success: false, error: error.message }
  }
}

// remove a note 
export const deleteNote = async (noteId, userId) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error in deleting note: ', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }

  } catch (error) {
    console.error('Error in deleting note: ', error)
    return { success: false, error: error.message }
  }
}


// ------------ TRANSACTION OPERATIONS ------------

// fetch all transactions for the current user
export const fetchTransactions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { success: false, error: error.message };
  }
};

// add a new transaction
export const addTransaction = async (transactionData, userId) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        date: transactionData.date,
        type: transactionData.type,
        name: transactionData.name,
        category: transactionData.category,
        method: transactionData.method,
        amount: transactionData.amount
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error adding transaction:', error);
    return { success: false, error: error.message };
  }
};

// update an transaction
export const updateTransaction = async (transactionId, transactionData, userId) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        date: transactionData.date,
        type: transactionData.type,
        name: transactionData.name,
        category: transactionData.category,
        method: transactionData.method,
        amount: transactionData.amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return { success: false, error: error.message };
  }
};

// delete a transaction
export const deleteTransaction = async (transactionId, userId) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting transaction:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return { success: false, error: error.message };
  }
};

// ------------ OVER/UNDER BUDGET OPERATIONS ------------

// fetch transactions for a specific month and year
export const fetchTransactionsByMonthYear = async (userId, month, year) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
      .lt('date', `${year}-${String(month + 1).padStart(2, '0')}-01`)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions by month/year:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching transactions by month/year:', error);
    return { success: false, error: error.message };
  }
};