 import React from 'react';
 
 // Sort.js Wrapper Component (HOC)
 export const Sort = ({children, by}) => {
    if (!by) { return children } // If no 'sort by property' provided, return original list

     // Compare function needed by the Sort component
    const compare = (a, b) => {
        // you can access the relevant property like this a.props[by]
        // depending whether you are sorting by title or year, for example, you can write a compare function here
        if (a.props[by] < b.props[by]) return -1;
    }
        

    return React.Children.toArray(children).sort(compare);
 }