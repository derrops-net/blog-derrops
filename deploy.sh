hexo generate
git -C public add . 
git -C public commit -m 'deploy'
git -C public push

#aws s3 sync ./public s3://bloghosting-20240430201125-hostingbucket-dev/
