
var budgetController = (function(){

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome){
    if (totalIncome > 0){
      this.percentage = Math.round((this.value / totalIncome)*100);
    }
    else{
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    allItems:{
      exp: [],
      inc: [],
    },
    totals:{
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(cur, index, array){
      sum+=cur.value;
    });
    data.totals[type] = sum;

    //calculate total income and expenses

    //calculate budget = income - expenses
    //calculate the percentage of income that we spent
  };
  return{
    addItem: function(type, des, val){
      var newItem, ID;
      //ID = last ID + 1
      //create new id
      if (data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      else{
        ID = 0;
      }

      //create new item based on 'inc' or 'exp' type
      if (type === "exp"){
        newItem = new Expense(ID, des, val);
      }
      else if (type==="inc"){
        newItem = new Income(ID, des, val);
      }
      data.allItems[type].push(newItem);
      //data.totals[type] += val;
      console.log(data);
      return newItem;
    },
    deleteItem: function(type, ID){
      var ids, index;
      ids = data.allItems[type].map(function(current, index, array){
        return current.id;
      });
      index = ids.indexOf(ID);

      if (index !== -1){
        data.allItems[type].splice(index, 1);
      };


    },
    calculateBudget: function(){
      calculateTotal("exp");
      calculateTotal("inc");

      data.budget = data.totals.inc - data.totals.exp;
      if (data.totals.inc > 0){
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      }
      else{
        data.percentage = -1;
      }

    },

    calculatePercentages:function(){
      data.allItems.exp.forEach(function(cur){
        cur.calcPercentage(data.totals.inc);
      })
    },

    getPercentages: function(){
      var allPercentages = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function(){
      return{
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpenses: data.totals.exp,
        percentage: data.percentage,
      };
    },
      testing:function(){
        console.log(data);
      },
    }


})();


var UIController = (function(){
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel : ".budget__value",
    incomeLabel : ".budget__income--value",
    expenseLabel : ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container:".container",
    expensesPercentageLabel:".item__percentage",
    dateLabel:".budget__title--month",

  };
  var formatNumber=function(num, type){
    var numSplit, int, dec, sign;
    //+ or - before number
    //exactly 2 decimal points
    //comma separating the thousands
    num = Math.abs(num);
    num = num.toFixed(2); //1000000

    numSplit = num.split(".");

    int = numSplit[0];
    if (int.length > 3){
      int = int.substr(0,int.length - 3) + "," + int.substr(int.length - 3,3);
    }
    dec=numSplit[1];
    type==='exp' ? sign = "-" : sign = "+";

    return sign + " " + int + "." + dec;
  };
  var nodeListForEach = function(list, callback){
    for (var i = 0; i<list.length; i++){
      callback(list[i], i);
    }
  };

  return{
    getInput: function(){
      return{
        type:  document.querySelector(DOMStrings.inputType).value, //either inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value : parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },

    addListItem:  function(obj, type){
      var html, newHTML, element;
      //create HTML with placeholder text
      if (type==='inc'){
        element = DOMStrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
    }
    else if (type==='exp'){
      element = DOMStrings.expensesContainer;
      html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
    }
    newHTML = html.replace('%id%', obj.id);
    newHTML = newHTML.replace('%description%', obj.description);
    newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
    document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
    },

    deleteListItem: function(selectorID){
      var el =   document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields:function(){
      var fields, fieldsArray;
      fields = document.querySelectorAll(DOMStrings.inputDescription + ", " + DOMStrings.inputValue);
      fieldsArray = Array.prototype.slice.call(fields);
      fieldsArray.forEach(function(cur, index, array){
        cur.value = "";
      });
      fieldsArray[0].focus();
    },

    displayBudget: function(obj){
      var type;
      obj.budget > 0 ? type = "inc" : type = "exp";
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, "inc");
      document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExpenses, "exp");


      if (obj.percentage > 0){
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      }
      else{
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function(percentages){
      var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);



      nodeListForEach(fields, function(current, index){
        if (percentages[index] > 0){
          current.textContent = percentages[index] + "%";
        }
        else{
          current.textContent = "---";
        }
      });
    },

      displayMonth: function(){
        var now, year, month, months;
        months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        now = new Date();
        year = now.getFullYear();
        month = now.getMonth();
        document.querySelector(DOMStrings.dateLabel).textContent = months[month] + " " + year;

      },

      changedType: function(){
        var fields = document.querySelectorAll(DOMStrings.inputType + "," + DOMStrings.inputDescription + "," + DOMStrings.inputValue);
        nodeListForEach(fields, function(cur){
          cur.classList.toggle("red-focus");
        });
        document.querySelector(DOMStrings.inputButton).classList.toggle("red");
      },



    getDOMStrings: function(){
      return DOMStrings;
    },
  };
})();

//Global app contoller
var controller = (function(budgetCtrl, UICtrl){

  var setupEventListeners = function(){
    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(e){
      if (e.keyCode === 13 || e.which === 13){
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
  }

  var updateBudget = function(){
        //1. calculate budget
        budgetCtrl.calculateBudget();
        //2. return budget
        var budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
        console.log(budget);
        //3. display budget on the UI
  }

  var updatePercentages = function(){
    //1.calculate percentages
    budgetCtrl.calculatePercentages();
    //2. read percentages from budget budget controller
    var percentages = budgetCtrl.getPercentages();
    //3. update UI with new percentages
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function(){
    var input, newItem, addListItem;
    //1. Get input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0){
    //2. add item to budget  budgetController
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);

    //3. add item to user interface
    UICtrl.addListItem(newItem, input.type);

    //4. clear fields
    UICtrl.clearFields();

    //5. calculate and update budget
    updateBudget();

    //6. calculate and update update percentages
    updatePercentages();
    console.log(newItem);
  }
};

var ctrlDeleteItem = function(event){
  var itemID, splitID, type, ID;
  itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

  if (itemID){
    splitID = itemID.split("-");
    type = splitID[0];
    ID = parseInt(splitID[1]);

    //delete item from data structure
    budgetCtrl.deleteItem(type, ID);
    //delete item from UI
    UICtrl.deleteListItem(itemID);
    //update and show new budget
    updateBudget();

    updatePercentages();
  }
}


  return {
    init: function(){
      console.log("App has started");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpenses: 0,
        percentage: -1,
      });
      setupEventListeners();

    }
  };
})(budgetController, UIController);

controller.init();
