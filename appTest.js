var budgetController = (function(){

   var Expense = function(id, description, value){
       this.id = id;
       this.description = description;
       this.value = value;
       percentage = 0;
    }

   var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allItens: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    }

    var calculateTotal = function(type){
        var sum = 0;
        data.allItens[type].forEach(function(current){
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    return{
        addItem: function(input){

            var newItem, type, id;
            type = input.type;

            //create an unique id = last id of the array plus one
            if(data.allItens[type].length > 0){
                id = data.allItens[type][data.allItens[type].length - 1].id + 1;
            }else{
                id = 0;
            }
            
            //create the new item based on the type (exp or inc)
            if(type === 'exp'){
                newItem = new Expense(id, input.description, input.value);
            }else if(type === 'inc'){
                newItem = new Income(id, input.description, input.value);
            }

            //ad the new item to the array based on the the type
            data.allItens[type].push(newItem);

            return newItem;
        },

        deleteItem: function(type, id){

            var ids, index;

            /* the map function returns an array with the itens returned from 
                 the function for each element of the array it is used */
            ids = data.allItens[type].map(function(current){
                return current.id;
            });

            // the indexOf returns the index of the item passed in the array 
            index = ids.indexOf(id);

            /* the splice method will remove the item with the index in the 
                first parameter from the array. The second parameter is how much
                elements we want to delete*/
            if(index !== -1){
                data.allItens[type].splice(index, 1);
            }
        },

        calculateBudget: function(){

            // calc total income n expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //calc the budget
            data.budget = data.totals.inc - data.totals.exp;

            //calc the percentage of income that was spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100); //round returns the closest integer
            }else{
                data.percentage = -1;
            }

        },

        newPercentages: function(){
            var percentage;
            if (data.totals.inc > 0){
                data.allItens.exp.forEach(function(current){
                    percentage = Math.round((current.value/data.totals.inc)*100);
                    current.percentage = percentage;
                });
            }else{
                data.allItens.exp.forEach(function(current){
                    current.percentage = 0;
                });
            }
            
        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function(){
            console.log(data);
        } 
    }

})();


var UIController = (function(){
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        buttonAdd: '.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container: '.container'
    };
    
    return{

        getInput: function(){
            return{
                type: document.querySelector(DOMStrings.inputType).value, // + = inc, - = exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function(obj, type){

            var html, newHtml, element;

            // chose the container n the html string will go in it based on the type
            if(type === 'inc'){
                element = DOMStrings.incomeContainer;
                html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            };

            //change the placeholders for the actual values 
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            //use a method to add the element right below the last one
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(id){
            //We need to get to the father then remove the child
            var element = document.getElementById(id);
            element.parentNode.removeChild(element);
        },

        clearFields: function(){
            var fields, fieldsArr;

            //selecting the 2 fields from the DOM. *QSAll returns a List, not an Array*
            fields = document.querySelectorAll(DOMStrings.inputDescription + 
                ', ' + DOMStrings.inputValue);

            //converting the list to an Array. *Slice returns an Array*
            fieldsArr = Array.prototype.slice.call(fields);

            //clearing the fields
            fieldsArr.forEach(function(current, index, array){
                current.value = '';
            });

            //set the cursor to focus on the description field
            fieldsArr[0].focus();
            
        },

        displayBudget: function(budget){
            document.querySelector(DOMStrings.budgetLabel).textContent = budget.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = budget.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent = budget.totalExp;

            if(budget.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = budget.percentage + '%';
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        getDOMStrings: function(){
            return DOMStrings;
        }

    }

})();


//Global app controler
var controller = (function(budgetCtrl, UICtrl){

    var DOM = UICtrl.getDOMStrings();

    var setupEventListeners = function(){

        document.querySelector(DOM.buttonAdd).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    }

    var updateBudget = function(){

        var budget;

        // calc the budget
        budgetCtrl.calculateBudget();

        // return the budget
        budget = budgetCtrl.getBudget();

        // display the budget
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function(){

        // update percentages in the budgetController and return the percentages
        budgetCtrl.newPercentages();

        // display the new percentages on the UI

    }
    
    function ctrlAddItem(){

        var input, newItem;
        
        // get the values of the fields
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value !== 0){
            // put this values in the budgetController
            newItem = budgetCtrl.addItem(input);
            updatePercentages();

            // put this values in the UIController
            UICtrl.addListItem(newItem, input.type);

            //clear the fields
            UICtrl.clearFields();

            updateBudget();
        }

    };

    var ctrlDeleteItem = function(event){

        var itemID, splitId, type, id;
      
        // traversing the DOM. Using the parentNode to acess the item we want
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        //ex: 'inc-2'. Returns an array ["inc", "2"]
        splitId = itemID.split('-');
        type = splitId[0];
        id = parseInt(splitId[1]);

        if(id >= 0){
            // delete item from the data structure
            budgetCtrl.deleteItem(type, id);
            // delete item from the UI
            UICtrl.deleteListItem(itemID);
            // update and show the new budget
            updateBudget(); 
            updatePercentages();
        }

        
        

        
        
    };

    return{
        init: function(){
            console.log('Started');
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();