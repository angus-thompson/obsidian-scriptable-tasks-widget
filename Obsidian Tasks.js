// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: magic;
String.prototype.trimRight = function(charlist) {
  if (charlist === undefined) charlist = "\s";
  return this.replace(new RegExp("[" + charlist + "]+$"), "");
};

function createWidget(tasks, today, displayTasks, textSize, maxLen, widgetHeight) {
  
  let linkRegex = /(.+)?(?=\[)(?:\[\[(.+)\]\]|\[(.+)\]\((.+)\))(.+)?/;
	
  //set up basic widget things
  let w = new ListWidget();
  w.url = `obsidian://advanced-uri?vault=${vault}&daily=true`;
  
  //Title
  let titleStack = w.addStack();
  titleStack.topAlignContent();
  let title = titleStack.addText("Tasks");
  title.font = Font.boldSystemFont(textSize*1.5);
  title.textColor = Color.dynamic(Color.black(), Color.white());
  title.minimumScaleFactor = 1;
  title.url = `obsidian://advanced-uri?vault=${vault}&daily=true&heading=` + title.text;
  
  titleStack.addSpacer(textSize*1.25);
  
  //Add new task button
  let newTasks = titleStack.addStack();
  let newTasksButton = newTasks.addText("+ Add New");
  newTasksButton.font = Font.semiboldRoundedSystemFont(textSize*1.25);
  newTasksButton.textColor = Color.dynamic(Color.gray(), Color.lightGray());
  newTasksButton.minimumScaleFactor = 1;
  newTasksButton.url = `obsidian://advanced-uri?vault=${vault}&daily=true&heading=New%20Tasks&data=%22-%20%5B%20%5D%20%22&mode=prepend`
  
  w.addSpacer(2);
  
  let mainStack = w.addStack();
  mainStack.layoutHorizontally();
	
  let widgetMaxLength = textSize*3+2
  
  //Adds stacks for each of my task groups
  for (let task of displayTasks) {
    let stack = mainStack.addStack();
    stack.layoutVertically();
		//Add title
    let title = stack.addText(task);
    title.url = `obsidian://advanced-uri?vault=${vault}&daily=true&heading=` + title.text.replaceAll(" ", "%20");
    title.textColor = Color.purple();
    title.font = Font.boldSystemFont(textSize*1.25);
    title.minimumScaleFactor = 1;
    stack.addSpacer(3);
  	let widgetLength = textSize*3+2
    let taskListLength = tasks[task].length;
    //If no tasks then print a message
    if (tasks[task].length == 0) {
      let line = stack.addText((task == `Overdue`) ? `Nothing Overdue!` : (task == "Two weeks") ? `Nothing Due in ${task}` : `Nothing Due ${task}!`);
      line.font = Font.boldSystemFont(textSize);
      line.textColor = Color.dynamic(Color.black(), Color.white());
    } else {
      //Else add the items from the clippeditems, only including up to 18 and adding See More... if more
      
      //Add each task, including links if necassary and add link to bullet point
      tasks[task] = tasks[task].slice(0, maxLen).map((itemArray)  => {
        item = itemArray[0]
      	let addTask = stack.addStack();
        addTask.lineLimit = 1;
        
        let imageManager = FileManager.iCloud();
        let imagePath = imageManager.bookmarkedPath("Scriptable")
        let imageOne = imageManager.downloadFileFromiCloud(imagePath + `/Complete.png`);
        let imageTwo = imageManager.downloadFileFromiCloud(imagePath + `/Incomplete.png`);
        
        if (itemArray[4] == today) {
          let bullet = addTask.addImage(imageManager.readImage(imagePath + `/Complete.png`));
          bullet.imageSize = new Size(textSize*1.25,textSize*1.25);
          bullet.url = URLScheme.forRunningScript() + `?openEditor=false&uriLaunch=true&task=${encodeURIComponent(itemArray[0])}&dateDue=${encodeURIComponent(itemArray[1])}&filePath=${encodeURIComponent(itemArray[2])}&lineNumber=${itemArray[3]}&complete=false`
        } else {
        	let bullet = addTask.addImage(imageManager.readImage(imagePath + `/Incomplete.png`));
          bullet.imageSize = new Size(textSize*1.25,textSize*1.25);
        	bullet.url = URLScheme.forRunningScript() + `?openEditor=false&uriLaunch=true&task=${encodeURIComponent(itemArray[0])}&dateDue=${encodeURIComponent(itemArray[1])}&filePath=${encodeURIComponent(itemArray[2])}&lineNumber=${itemArray[3]}&complete=true`;
        }
        //When a task has a link (website or note link), make sure link is interactable, and rest of task is not)
      	if (linkRegex.test(item)) {
          let before = addTask.addText(item.replace(linkRegex, "$1"))
   	  	  before.font = Font.systemFont(textSize);
    	    before.textColor = Color.dynamic(Color.black(), Color.white());
          before.lineLimit = 1;
          
        	if (item.replace(linkRegex, "$2")) {
	          let link = addTask.addText(item.replace(linkRegex, "$2"))
            //filePath = item.replace(linkRegex, "$2").replaceAll(" ", "%2520") + ".md"
            link.url = `obsidian://advanced-uri?vault=${vault}&filepath=` + item.replace(linkRegex, "$2").replaceAll(" ", "%2520") + ".md"
            link.textColor = new Color("#7e1dfb");
          	link.font = Font.semiboldRoundedSystemFont(textSize);
          	link.lineLimit = 1;
          } else {
            let link = addTask.addText(item.replace(linkRegex, "$3"))
            link.url = item.replace(linkRegex, "$4")
            link.textColor = new Color("#7e1dfb");
          	link.font = Font.semiboldRoundedSystemFont(textSize);
          	link.lineLimit = 1;
          }
          
        	let after = addTask.addText(item.replace(linkRegex, "$5"))
        	after.font = Font.systemFont(textSize);
        	after.textColor = Color.dynamic(Color.black(), Color.white());
          after.lineLimit = 1;
        } else {
          let line = addTask.addText(item)
          line.font = Font.systemFont(textSize);
          line.textColor = Color.dynamic(Color.black(), Color.white());
          line.lineLimit = 1;
        }
        
        //For measuring length of widget to add a spacer later to make sure widget stays aligned to top
        widgetLength += textSize*1.25
        if (widgetLength > widgetMaxLength) {
          widgetMaxLength = widgetLength
        }
        
      	return item;
      });
      //Add a see more... button if there are more tasks available
      if (tasks[task].length < taskListLength) {
        let more = stack.addText("See more...")
        more.font = Font.semiboldRoundedSystemFont(textSize);
        more.textColor = new Color("#8f6fff");
        more.url = `obsidian://advanced-uri?vault=${vault}&daily=true&heading=` + title.text.replaceAll(" ", "%20");
        widgetMaxLength += textSize*1.25
      }
      stack.minimumScaleFactor = 1;
    }
    
    
    mainStack.addSpacer(10);
    
  }
  
  w.addSpacer(widgetHeight-widgetMaxLength);
  
  return w
}


// This is the main function to comb through my folder structure for every daily note- Comb each note for something that matches a regex "- [ ] xxx" with out without an ending date "YYYY-MM-DD"
async function findTasks(today) {
  
  //Set up file manager, finds the amount of Year folders in the Daily Notes folder and sets up storage arrays
  let fileManager = FileManager.iCloud();
  let years = await fileManager.listContents(fileManager.bookmarkedPath(root));
  let overdueTasks = [];
  let todayTasks = [];
  let tomorrowTasks = [];
  let nextTwoWeeksTasks = [];
  let longTermTasks = [];
  //const dateRegex = /\d\d\d\d-\d\d-\d\d/;
  
  //Loops through each year folder
  for (let year of years) { 
    if (fileManager.isDirectory(fileManager.bookmarkedPath(root)+ "/" + year)) {
      
      //Finds each month folder in the year and loops through
      let months = await fileManager.listContents(fileManager.bookmarkedPath(root)+ "/" + year);
      for (let month of months) {
        
        //If month is a FOLDER - search for individual notes
        if (fileManager.isDirectory(fileManager.bookmarkedPath(root)+ "/" + year + "/" + month)) {
          let files = await fileManager.listContents(fileManager.bookmarkedPath(root)+ "/" + year + "/" + month);
          for (let file of files) {
            
            //Download file from icloud, read contents, split by line, store file path
            let downloadFile = await fileManager.downloadFileFromiCloud(fileManager.bookmarkedPath(root)+ "/" + year + "/" + month + "/" + file);
            let fileContents = await fileManager.readString(fileManager.bookmarkedPath(root)+ "/" + year + "/" + month + "/" + file);
            let lines = fileContents.split("\n");
            let originalTaskPath = "/" + year + "/" + month + "/" + file
            let lineIndex = 0

            for (let line of lines) {
              //Regexp to filter tasks and make a match that has [Full task, Task name, Due date, Task Name if no due date]
              let taskRegex = /- \[[x ]\]\s*(.*?)(?:(?=(?:\d{4}-\d{2}-\d{2}))(\d{4}-\d{2}-\d{2})|\s*\n)(?:\s+✅\s*(\d{4}-\d{2}-\d{2}))?/;
              let match = line.match(taskRegex);
              
              //If found a task
              if (match) {
                let completionDate = parseInt(Date.parse(match[3]));
                //If Task has a due date
                if (match[3] == null || completionDate == dateToday) {
                  if (match[2]) {
                	
	                  //Sets up data to add to task arrays.
 	 	              	let matchName = match[1].trimRight("📅 ");
  	              	let date = parseInt(Date.parse(match[2]));
                	
                  
                  //sort task to array based on due date
    	             	if (date == dateToday) {
      	              todayTasks.push([matchName, date, match[2], originalTaskPath, lineIndex, match[3]]);
                      
        	          } else if (date < dateToday) {
         	          	overdueTasks.push([matchName, date, match[2], originalTaskPath, lineIndex, match[3]]);
          	          
           	       	} else if (date <= tomorrow) {
            	        tomorrowTasks.push([matchName, date, match[2], originalTaskPath, lineIndex, match[3]]);
             	       
              	   	} else if (date <= twoWeeks) {
               	    	nextTwoWeeksTasks.push([matchName, date, match[2], originalTaskPath, lineIndex, match[3]]);
                      
                	 	} else {
                			longTermTasks.push([matchName, match[2], originalTaskPath, lineIndex, match[3]])
                  	}
                  }
                }
                
              }
              lineIndex += 1
            }
          }
        }
      }
    }
  }
  
	let tasks = {"Overdue" : overdueTasks, "Today" : todayTasks, "Tomorrow" : tomorrowTasks, "Two weeks" : nextTwoWeeksTasks, "Long Term" : longTermTasks};
	
  //sort each task list by due date (earliest due at top)
  for (task in tasks) {
    tasks[task].sort(function(a, b) {
  		return a[1] - b[1];
		});
    for (x = 0; x < tasks[task].length; x++) {
      tasks[task][x] = [tasks[task][x][0], tasks[task][x][2], tasks[task][x][3], tasks[task][x][4], tasks[task][x][5]];
    }
  }

  return tasks;
}


const uriArguments = args.queryParameters;
const widgetArguments = args.widgetParameter;


//Change these to your bookmarked path folder and vault name
const vault = "CHANGE THIS"
const root = "CHANGE THIS";
let displayTasks = ["Overdue", "Today", "Tomorrow", "Two weeks", "Long Term"];
if (widgetArguments) {
  displayTasks = widgetArguments.split("|");
}


//get today in format YYYY-MM-DD, also gets dateToday in millisecond format and tomorrow, and two weeks so that they can get compared later to decide when tasks are due
const todayDate = new Date();
const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`
const dateToday = parseInt(Date.parse(today));
const tomorrow = dateToday+86400000;
const twoWeeks = dateToday+86400000*14;

let tasks = await findTasks(today);
//const textSize = 12
//const maxLen = 17

if (config.runsInWidget) {
  let textSize = 0;
  let maxLen = 0
  //widget height is very dependent on device type
  let widgetHeight = 0
  if (config.widgetFamily == "extraLarge") {
  	textSize = 12;
  	maxLen = 17;
    widgetHeight = 288.5
	} else if (config.widgetFamily == "large") {
  	textSize = 17;
		maxLen = 12;
    widgetHeight = 288.5
	} else if (config.widgetFamily == "medium") {
	  textSize = 17;
		maxLen = 3;
    widgetHeight = 130
	} else if (config.widgetFamily == "small") {
		textSize = 10;
		maxLen = 12;
    widgetHeight = 130
	} else if (config.widgetFamily == null) {
    textSize = 12;
  	maxLen = 17;
    widgetHeight = 288.5
  }
  
  let widget = createWidget(tasks, today, displayTasks, textSize, maxLen, widgetHeight);
  Script.setWidget(widget);
  Script.complete();
} else if (uriArguments.uriLaunch) {
  App.close();
  let fileManager = FileManager.iCloud();
  let downloadFile = await fileManager.downloadFileFromiCloud(fileManager.bookmarkedPath(root) + uriArguments.filePath);
  let fileLines = fileManager.readString(fileManager.bookmarkedPath(root) + uriArguments.filePath);
  fileLines = fileLines.split("\n");
  let replaceRegex = new RegExp(`- \\[[ x]\\] ${uriArguments.task.replaceAll("\[", "\\[").replaceAll("\]", "\\]").replaceAll("\(", "\\(").replaceAll("\)", "\\)")}.*📅.*${uriArguments.dateDue}.*`)
  
  for (let i = 0; i < fileLines.length; i++) {
    if (fileLines[i].match(replaceRegex)) {
      if (uriArguments.complete == "true") {
      	fileLines[i] = "- [x] " + uriArguments.task + " 📅 " + uriArguments.dateDue + " ✅ " + today;
      } else {
        fileLines[i] = "- [ ] " + uriArguments.task + " 📅 " + uriArguments.dateDue;
      }
    }
  }
  
  fileLines = fileLines.join("\n");
  fileManager.writeString(fileManager.bookmarkedPath(root) + uriArguments.filePath, fileLines);
} else {
  const textSize = 12;
  const maxLen = 17;
  let widget = createWidget(tasks, today, displayTasks, textSize, maxLen);
  widget.presentExtraLarge();
}
