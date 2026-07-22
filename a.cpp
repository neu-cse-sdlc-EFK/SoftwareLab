#include <bits/stdc++.h>
#include<ext/pb_ds/assoc_container.hpp>
#include<ext/pb_ds/tree_policy.hpp>
using namespace __gnu_pbds;
using namespace std;
// template <typename T> using pbds = tree<T, null_type, less<T>, rb_tree_tag, tree_order_statistics_node_update>; // for set
template <typename T> using pbds = tree<T, null_type, less_equal<T>, rb_tree_tag, tree_order_statistics_node_update>; // for multiset
#define int long long
#define float double
#define endl '\n'
template <typename Container>
void sort(Container& c) {
    std::sort(c.begin(), c.end());
}
template <typename Container>
void sort(Container& c, bool reverse) {
    if (reverse) {
        std::sort(c.rbegin(), c.rend());
    } else {
        std::sort(c.begin(), c.end());
    }
}


int32_t main() 
{
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    
    return 0;
}