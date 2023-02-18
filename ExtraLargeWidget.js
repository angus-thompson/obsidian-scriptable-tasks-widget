String.prototype.trimRight = function(charlist) {
  if (charlist === undefined) charlist = "\s";
  return this.replace(new RegExp("[" + charlist + "]+$"), "");
};

function createWidget(items, today) {
  
  let clippedItems = items.slice(0, 5);
  let linkRegex = /(.+)?(?=\[)(?:\[\[(.+)\]\]|\[(.+)\]\((.+)\))(.+)?/;
	
  //set up basic widget things
  let w = new ListWidget();
  w.url = `obsidian://advanced-uri?vault=${vault}&daily=true`;
  
  //Title
  let titleStack = w.addStack();
  titleStack.topAlignContent();
  let title = titleStack.addText("Tasks");
  title.font = Font.boldSystemFont(18);
  title.textColor = Color.dynamic(Color.black(), Color.white());
  title.minimumScaleFactor = 1;
  title.url = `obsidian://advanced-uri?vault=${vault}&daily=true&heading=` + title.text;
  
  titleStack.addSpacer(15);
  
  //Add new task button
  let newTasks = titleStack.addStack();
  let newTasksButton = newTasks.addText("+ Add New");
  newTasksButton.font = Font.semiboldRoundedSystemFont(15);
  newTasksButton.textColor = Color.dynamic(Color.gray(), Color.lightGray());
  newTasksButton.minimumScaleFactor = 1;
  newTasksButton.url = `obsidian://advanced-uri?vault=${vault}&daily=true&heading=New%20Tasks&data=%22-%20%5B%20%5D%20%22&mode=prepend`
  
  
  w.addSpacer(2);
  
  let mainStack = w.addStack();
  mainStack.layoutHorizontally();
	
  let widgetLength = 38
  let widgetMaxLength = 38
  
  //Adds stacks for each of my task groups
  for (let i = 0; i < 5; i++) {
    let stack = mainStack.addStack();
    stack.layoutVertically();
		//Add title
    let title = stack.addText(["Overdue", "Today", "Tomorrow", "Two Weeks", "Long Term"][i]);
    title.url = `obsidian://advanced-uri?vault=${vault}&daily=true&heading=` + title.text.replaceAll(" ", "%20");
    title.textColor = Color.purple();
    title.font = Font.boldSystemFont(15);
    title.minimumScaleFactor = 1;
    stack.addSpacer(3);
  	let widgetLength = 38
    
    //If no tasks then print a message
    if (clippedItems[i].length === 0) {
      let line = stack.addText(`Nothing ${["Overdue", "Due Today", "Due Tomorrow", "Due in Two Weeks", "Due Long Term"][i]}!`);
      line.font = Font.boldSystemFont(12);
      line.textColor = Color.dynamic(Color.black(), Color.white());
    } else {
      //Else add the items from the clippeditems, only including up to 18 and adding See More... if more
      let maxLen = 18;
      
      //Add each task, including links if necassary and add link to bullet point
      clippedItems[i] = clippedItems[i].slice(0, maxLen).map((itemArray)  => {
        item = itemArray[0]
      	let task = stack.addStack();
        task.lineLimit = 1;
        let bullet = task.addText("▫️");        
        bullet.url = URLScheme.forRunningScript() + `?openEditor=false&uriLaunch=true&task=${encodeURIComponent(itemArray[0])}&dateDue=${encodeURIComponent(itemArray[1])}&filePath=${encodeURIComponent(itemArray[2])}&lineNumber=${itemArray[3]}`;
	      bullet.font = Font.systemFont(12);
 	   	  bullet.textColor = Color.dynamic(Color.black(), Color.white());
        
        //When a task has a link (website or note link), make sure link is interactable, and rest of task is not)
      	if (linkRegex.test(item)) {
          let before = task.addText(item.replace(linkRegex, "$1"))
   	  	  before.font = Font.systemFont(12);
    	    before.textColor = Color.dynamic(Color.black(), Color.white());
          before.lineLimit = 1;
          
        	if (item.replace(linkRegex, "$2")) {
	          let link = task.addText(item.replace(linkRegex, "$2"))
            //filePath = item.replace(linkRegex, "$2").replaceAll(" ", "%2520") + ".md"
            link.url = `obsidian://advanced-uri?vault=${vault}&filepath=` + item.replace(linkRegex, "$2").replaceAll(" ", "%2520") + ".md"
            link.textColor = new Color("#7e1dfb");
          	link.font = Font.semiboldRoundedSystemFont(12);
          	link.lineLimit = 1;
          } else {
            let link = task.addText(item.replace(linkRegex, "$3"))
            link.url = item.replace(linkRegex, "$4")
            link.textColor = new Color("#7e1dfb");
          	link.font = Font.semiboldRoundedSystemFont(12);
          	link.lineLimit = 1;
          }
          
        	let after = task.addText(item.replace(linkRegex, "$5"))
        	after.font = Font.systemFont(12);
        	after.textColor = Color.dynamic(Color.black(), Color.white());
          after.lineLimit = 1;
        } else {
          let line = task.addText(item)
          line.font = Font.systemFont(12);
          line.textColor = Color.dynamic(Color.black(), Color.white());
          line.lineLimit = 1;
        }
        
        //For measuring length of widget to add a spacer later to make sure widget stays aligned to top
        widgetLength += 14.5
        if (widgetLength > widgetMaxLength) {
          widgetMaxLength = widgetLength
        }
        
      	return item;
      });
      
      //Add a see more... button if there are more tasks available
      if (clippedItems[i].length < items[i].length) {
        let more = stack.addText("See more...")
        more.font = Font.semiboldRoundedSystemFont(12);
        more.textColor = new Color("#8f6fff");
        more.url = `obsidian://advanced-uri?vault=${vault}&daily=true&heading=` + title.text.replaceAll(" ", "%20");
        widgetMaxLength += 15.5
      }
      stack.minimumScaleFactor = 1;
    }
    
    
    mainStack.addSpacer(10);
    
  }
  
  w.addSpacer(288.5-widgetMaxLength);
  
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
  const dateRegex = /\d\d\d\d-\d\d-\d\d/;
  
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
              let taskRegex = new RegExp("- \\[ \\] (.*) (\\d\\d\\d\\d-\\d\\d-\\d\\d)|- \\[ \\] (.+)");
              let match = line.match(taskRegex);
              //If found a task
              if (match) {
                //If Task has a due date
                if (match[2]) {
                	
                  //Sets up data to add to task arrays.
                	let matchName = match[1].trimRight("📅");
                	let date = parseInt(Date.parse(match[2]));
                	let dueDay = match[2].replace(dateRegex, "$2");
                  
                  //sort task to array based on due date
                  if (date == dateToday) {
                    todayTasks.push([matchName, date, match[2], originalTaskPath, lineIndex]);
                    
                  } else if (date < dateToday) {
                    overdueTasks.push([matchName, date, match[2], originalTaskPath, lineIndex]);
                    
                  } else if (date <= tomorrow) {
                    tomorrowTasks.push([matchName, date, match[2], originalTaskPath, lineIndex]);
                    
                  } else if (date <= twoWeeks) {
                    nextTwoWeeksTasks.push([matchName, date, match[2], originalTaskPath, lineIndex]);
                    
                  }
                  
                } else {
                  let matchName = match[3].trimRight("📅");
                  longTermTasks.push([matchName, match[2], originalTaskPath, lineIndex])
                }
              }
              lineIndex += 1
            }
          }
        }
      }
    }
  }
  
	let tasks = [overdueTasks, todayTasks, tomorrowTasks, nextTwoWeeksTasks, longTermTasks];
	
  //sort each task list by due date (earliest due at top)
  for (let i = 0; i < 4; i++) {
    tasks[i].sort(function(a, b) {
  		return a[1] - b[1];
		});
    for (x = 0; x < tasks[i].length; x++) {
      tasks[i][x] = [tasks[i][x][0], tasks[i][x][2], tasks[i][x][3], tasks[i][x][4]];
    }
  }

  return tasks;
}


const uriArguments = args.queryParameters


//Change these to your bookmarked path folder and vault name
const vault = "Test"
const root = "Test";


//get today in format YYYY-MM-DD, also gets dateToday in millisecond format and tomorrow, and two weeks so that they can get compared later to decide when tasks are due
const todayDate = new Date();
const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`
const dateToday = parseInt(Date.parse(today));
const tomorrow = dateToday+86400000;
const twoWeeks = dateToday+86400000*14;

let items = await findTasks(today);
let widget = createWidget(items, today);

if (config.runsInWidget) {
  Script.setWidget(widget);
  Script.complete();
} else if (uriArguments.uriLaunch) {
  App.close();
  let fileManager = FileManager.iCloud();
  let downloadFile = await fileManager.downloadFileFromiCloud(fileManager.bookmarkedPath(root) + uriArguments.filePath);
  let fileLines = fileManager.readString(fileManager.bookmarkedPath(root) + uriArguments.filePath);
  fileLines = fileLines.split("\n");
  fileLines[uriArguments.lineNumber] = "- [x] " + uriArguments.task + " 📅" + uriArguments.dateDue + " ✅" + today;
  fileLines = fileLines.join("\n");
  fileManager.writeString(fileManager.bookmarkedPath(root) + uriArguments.filePath, fileLines);
} else {
  widget.presentExtraLarge();
}
