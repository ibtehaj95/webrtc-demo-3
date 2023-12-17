gnome-terminal --title 'webpack' -- npm run serve --prefix ./frontend
# gnome-terminal --title 'webpack' -- bash -c "npm run serve --prefix ./frontend &> output_front.txt" #debugging
gnome-terminal --title 'backend' -- npm start --prefix ./backend
# gnome-terminal --title 'backend' -- bash -c "npm start --prefix ./backend &> output_back.txt" #debugging