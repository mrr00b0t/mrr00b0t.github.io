
from PyQt5 import uic
from PyQt5.QtWidgets import *

class Main:
    def __init__(self):
        self.listui = uic.loadUi('listui.ui')
        self.listui.pbDeleteitem.clicked.connect(self.deleteitem)
        self.listui.pbPrintitem.clicked.connect(self.printitem)
        self.listui.pbPrintallitem.clicked.connect(self.printallitems)
        self.listui.pbAdditem.clicked.connect(self.additem)
        self.listui.show()
    
    def additem(self):
        newitem = self.listui.editAdditem.text()
        self.listui.listBox.addItem(newitem)
        self.listui.editAdditem.clear()
        
        
    
    def deleteitem(self):
        selected_items = self.listui.listBox.selectedItems()
        
        for item in selected_items:
            row = self.listui.listBox.row(item)
            self.listui.listBox.takeItem(row)
            
    def printitem(self):
        selected_items = self.listui.listBox.selectedItems()
        
        for item in selected_items:
            print(item.text())
        
    def printallitems(self):
        for index in range(self.listui.listBox.count()):
            item = self.listui.listBox.item(index)
            print(item.text())

if __name__ == '__main__':
    app = QApplication([])
    mymain = Main()
    app.exec()
